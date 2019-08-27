import React from "react";
import OpentTypeTest from "./OpenTypeTest";

export default class App extends React.Component<{},{}> {
    render() {
        return (
            <div style={{position:'absolute', top: 0, bottom: 0, left:0, right:0, display:'flex', flexDirection:'column'}}>
                <h1>Test App</h1>
                <OpentTypeTest />
            </div>
        )
    }
}