import React from 'react';

const Test = (props) => {
    const id = props.match.params.id;
    return (
        <p>{id}</p>
    )
}

export default Test;