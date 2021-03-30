import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

//cssスタイル
const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

//videoタグの機能を持つheight40%,width50%のStyledVideoというタグを定義
const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

//Videoタグ
const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        //peerでstreamを受け取ったら処理する
        props.peer.on("stream", stream => {
            //srcObject：HTMLMediaElementインターフェイスのプロパティ
            //メディアソースを提供するオブジェクトを設定する
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}

//ビデオ設定
const videoConstraints = {
    facingMode: "environment",
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const backendURL = process.env.REACT_APP_API || "http://localhost:8000";

    useEffect(() => {
        socketRef.current = io.connect(backendURL);
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            //srcObject：HTMLMediaElementインターフェイスのプロパティ
            //メディアソースを提供するオブジェクトを設定する
            userVideo.current.srcObject = stream;
            //接続されているすべてのクライアントにイベントを発行
            socketRef.current.emit("join room", roomID);
            //.on:指定されたイベントの新しいハンドラーを登録、socketを返す
            //all usersイベントでルームの全てのユーザーをsocketで受け取り処理する
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    //部屋に入ったそれぞれの人について新しいPeerを作る
                    //socketRef.current.id:新規入室者のid
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer
                    })
                    peers.push(peer);
                });
                setPeers(peers);
            });

            socketRef.current.on("user joined", payload => {
                //入ってきたユーザーのシグナルとIDをaddPeerに渡す
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer
                })
                setPeers(users => [...users, peer]);
            });

            //ルームにいる他のユーザーからシグナルを受け取ったら呼び出す
            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        //peerを作成。initiator:開始ピアであるのでtrue
        //trickleICEが無効にし、単一の「シグナル」イベントが取得
        //video/audioが必要な場合、ストリームを渡す
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream
        });
        //ピアがシグナリングデータをリモートピアに送信した場合に発生
        //peerのinitiatorをtrueにしているので、この場合すぐに発生する
        peer.on("signal", signal => {
            //sending signalにデータを送る
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })
        peer.on("error", error => {
            console.log(error);
        })
        return peer;
    }

    //incomingSignal:今入ってきたユーザーのシグナル
    function addPeer(incomingSignal, callerID, stream) {
        //新入室者のpeer設定
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream
        })
        //新入室者のsignalイベントのハンドラーを登録
        peer.on("signal", signal => {
            //新しい入室者からシグナルを受け取ったら、returning signalイベントにデータを送る
            socketRef.current.emit("returning signal", { signal, callerID })
        })
        //他の既入室者にsignalを送る
        peer.signal(incomingSignal);
        return peer;
    }

    return (
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};

export default Room;