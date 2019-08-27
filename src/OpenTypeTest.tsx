import React, { useRef, useEffect, useState, RefObject } from "react";


function setupCanvas(canvasRef:React.RefObject<HTMLCanvasElement>, width:number,height:number) {
    useEffect(() => {        
        console.log('mounted', canvasRef.current)
        let canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        return () => {
            console.log('unmounted', canvasRef.current)
        }
    },[canvasRef])
}

interface ICanavasContext{
    width:number
    height:number
    ctx:CanvasRenderingContext2D
}

function createCanvasContext(canvas:HTMLCanvasElement) {
    return {
        ctx: canvas.getContext("2d"),
        width: canvas.width,
        height: canvas.height
    }
}

function fill(context:ICanavasContext, color:string) {
    let ctx = context.ctx
    context.ctx.fillStyle = color;
    ctx.fillRect(0, 0, context.width, context.height);    
}

function createReference(canvas:HTMLCanvasElement) {
    var context = createCanvasContext(canvas)
    fill(context, "#DDD")
    return context
}

function createTest(canvas:HTMLCanvasElement) {
    var context = createCanvasContext(canvas)
    fill(context, "#EEE")
    return context
}

function drawTextNative(canvasRef:RefObject<HTMLCanvasElement>,textState:string/*TODO: typing*/) {
    useEffect(() => {
        var context = createCanvasContext(canvasRef.current)
        fill(context, "#DDD")

        let ctx = context.ctx

        ctx.fillStyle = "#000";
        ctx.font = "16px Times New Roman";
        ctx.fillText(textState, 10, 50);

    },[canvasRef,textState])
}

function drawTextOpenType(canvasRef:RefObject<HTMLCanvasElement>,textState:string/*TODO: typing*/) {
    useEffect(() => {
        var context = createCanvasContext(canvasRef.current)
        fill(context, "#DDD")

        let ctx = context.ctx

        ctx.fillStyle = "#000";
        ctx.font = "16px Times New Roman";
        ctx.fillText(textState, 10, 50);

    },[canvasRef,textState])
}

export default function OpentTypeTest() {

    let canvasRef0 = useRef(null)
    let canvasRef1 = useRef(null)

    let width = 640
    let height = 480

    let [text,setText] = useState("Hello Hooks!!")

    setupCanvas(canvasRef0, width, height)
    setupCanvas(canvasRef1, width, height)

    drawTextNative(canvasRef0, text)    
    drawTextOpenType(canvasRef1, text)

    return (
        <div style={{display:'flex', flexDirection:'column',justifyContent:'center', alignItems:'center', backgroundColor:'#CCC', flexGrow:1}}>
            <div style={{border: '1px solid black'}}>
                <div>Open Type Test</div>
                <input
                    // ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                />                
                <div style={{display:'flex', flexDirection:'row'}}>
                    <canvas ref={canvasRef0} />
                    <canvas ref={canvasRef1} />
                </div>
            </div>

        </div>
    )
}