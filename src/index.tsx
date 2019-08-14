import React, { useContext } from 'react'
import {render as renderReactApp} from 'react-dom'
import App from './App'

renderReactApp(
    <App />,
    document.getElementById('app')
);

let url = './assets/helloworld.pdf';

import pdfjsLib from 'pdfjs-dist'
//import softwareCanvas from '../../node-pureimage'


var opentype = require('opentype.js')

//
// The workerSrc property shall be specified.
//
// pdfjsLib.GlobalWorkerOptions.workerSrc =
//   '../../node_modules/pdfjs-dist/build/pdf.worker.js';

//
// Asynchronous download PDF
//

main()

async function main() {
    await init()
    start()
}

let fonts:{[name:string]:IDrawingFont} = {}

async function init() {
    let resolve
    let promise = new Promise(r => resolve = r)
    //let times = softwareCanvas.registerFont('assets/times.ttf', 'Times')
    //times.load(() => resolve())    
    opentype.load('assets/times.ttf', (err, font) => {
        if(err) throw err
        fonts['Times'] = new WrappedOpenTypeFont(font)
        resolve()
    })
}

interface IPDFViewport {
    width:number,
    height:number
}

function start() {
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
      //
      // Fetch the first page
      //
      pdf.getPage(1).then(function(page) {
        var scale = 1;
        var viewport:IPDFViewport = page.getViewport({ scale: scale, });
    
        //
        // Prepare canvas using PDF page dimensions
        //
    
        var context = getCanvasContext(viewport.height, viewport.width)
        renderPage(page,context,viewport)
    
        var softContext = getSoftwareCanvasContext(viewport.height,viewport.width)
        renderPage(page,softContext,viewport)
    
      });
    });
}
function renderPage(page,context,viewport) {
    //
    // Render PDF page into canvas context
    //
    var renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
}

enum ContextFillRule {
    NONE = "",
    NONZERO = "nonzero"
}

enum ContextLineCap {
    NONE = "",
    BUTT = "butt"
}

enum ContextLineJoin {
    NONE = "",
    MITER = "miter"
}

enum ContextGlobalCompositeOperation {
    NONE = "",
    SOURCE_OVER = "source-over"
}

enum DrawingFontStyle {
    Normal = "normal",
    Italic = "italic",
    Oblique = "oblique"
}

enum DrawingFontVariant {
    Normal = "normal",
    //TODO:
}

interface IDrawingContextState {
    x:number,
    y:number,
    strokeStyle:string //#000000
    fillStyle:string //#00000
    fillRule:ContextFillRule
    globalAlpha: number
    lineWidth: number,
    lineCap: ContextLineCap,
    lineJoin: ContextLineJoin,
    font: string //10px sans-serif
    fontStyle: DrawingFontStyle
    fontObliqueAngle:number
    fontVariants: DrawingFontVariant[]
    fontSize:number //TODO: support non-pixel sizes
    lineHeight:number
    fontFamily:string
    fontFamilyAlternative:string
    //TODO: font-stretch
    transformationMatrix: [number,number,number,number,number,number]
}

interface IDrawingContext {
    setLineDash: () => void
    mozCurrentTransform:IDrawingTransform
}

class SoftwareContext implements IDrawingContext {
    state:Partial<IDrawingContextState> = {}

    _height:number
    _width:number
    _temp2dContext:CanvasRenderingContext2D

    constructor(width, height, fakeContext) {
        this._temp2dContext = fakeContext
        this._width = width
        this._height = height
    }

    set font(value:string) {
        console.warn("Unable to full parse font: " + value)
        this.state.fontFamily = "Times"
        let parts = value.split(" ");
        //TODO: proper font parsing
        //normal normal 16px "Times", serif
        if(parts.length == 5) {        
            let fontStyle = parts[0]
            let fontVariant = parts[1]
            let fontSize = parts[2]
            if(fontSize.endsWith("px")) {
                this.state.fontSize = parseFloat(fontSize.substr(0,fontSize.length-2))                
            }
            let quotedFontName = parts[3]
            if(quotedFontName.startsWith('"') && quotedFontName.endsWith('",')) {
                this.state.fontFamily = quotedFontName.substr(1,quotedFontName.length-3)
            }
            let fontAlternative = parts[4]
        }
    }

    set fillStyle(value:string) {
        this.state.fillStyle = value
    }

    set strokeStyle(value:string) {
        this.state.strokeStyle = value
    }

    get mozCurrentTransform():IDrawingTransform {        

        var transform = new MozCurrentTransform()
        var proxy = new Proxy(transform, new ProxyHandler("mozCurrentTransform"))        
        return proxy
    }    

    setLineDash() {
        console.warn("setLineDash not implemented")   
        console.table(arguments)        
    }

    beginPath() {
        console.warn("beginPath not implemented")   
        console.table(arguments)
    }

    fillRect() {
        console.warn("fillRect not implemented")   
        console.table(arguments)
    }

    fillText = (text:string,x:number,y:number,...args) => {
        if(args.length > 0) {
            console.warn("fillText not implemented for > 3 arguments")   
            console.table(args)            
        }        
        let currentFontFamily = this.state.fontFamily
        let font:IDrawingFont
        debugger
        if(currentFontFamily != null) {
            font = fonts[currentFontFamily]
        }

        if(font != null) {
            let glyphs = font.stringToGlyphs(text)
            let x = this.state.x
            let y = this.state.y
            for(let i = 0; i < glyphs.length; i++) {
                let glyph = glyphs[i]               
                let bbox = {x1:0,y1:0,x2:0,y2:0}
                try {
                    bbox = glyph.getBoundingBox() 
                }
                catch(err) {
                    console.error(err)
                }
                let canvas = document.createElement('canvas');
                canvas.width = 2048//bbox.x2 - bbox.x1
                canvas.height = 2048//bbox.y2 - bbox.y1
                let ctx = canvas.getContext("2d")
                //ctx.fillStyle = "blue"
                //ctx.fillRect(0, 0, canvas.width, canvas.height);
                let otGlyph = (glyph as any).glyph as IOpenTypeGlyph
                otGlyph.draw(ctx,0,16,16)
                this._temp2dContext.save()
                //this._temp2dContext.scale(1,-1)                     
                this._temp2dContext.translate(x,this._height - y)                           
                this._temp2dContext.drawImage(canvas,0,0)
                this._temp2dContext.restore()
                let scaleFromFont = 0.1
                x += otGlyph.advanceWidth * scaleFromFont
                //this._temp2dContext.scale(1,1)
            }
        }
        else {
            this.__canvaswithCurrentState(() => this._temp2dContext.fillText(text,x,y))
        }
    }

    __canvaswithCurrentState(action:()=>void) {
        this._temp2dContext.save()
        this._temp2dContext.translate(this.state.x,this._height - this.state.y)
        this._temp2dContext.fillStyle = this.state.fillStyle
        this._temp2dContext.strokeStyle = this.state.fillStyle
        action()
        this._temp2dContext.restore()        
    }

    measureText():IDrawingTextMeasurement {
        console.warn("measureText not implemented")   
        console.table(arguments)                

        var instance = {
            width: 1
        }
        var proxy = new Proxy(instance, new ProxyHandler("fontMeasurement"))             
        return proxy
    }
 
    save() {
        console.warn("save not implemented")   
        console.table(arguments)        
    }

    restore() {
        console.warn("restore not implemented")   
        console.table(arguments) 
    }
    
    transform(a:number,b:number,c:number,d:number,e:number,f:number) {
        this.state.transformationMatrix = [a,b,c,d,e,f]
    }

    translate(x:number,y:number) {
        this.state.x = x
        this.state.y = y
    }

    scale() {
        console.warn("scale not implemented")   
        console.table(arguments) 
    }
}

function getSoftwareCanvasContext(height, width) {        
    //var img = softwareCanvas.make(height,width);        
    //var fakeContext = img.getContext('2d')    
    debugger
    var canvas = document.getElementById('test-canvas') as HTMLCanvasElement;
    var context = canvas.getContext('2d');
    canvas.height = height;
    canvas.width = width;


    var softwareContext = new SoftwareContext(width, height, context)
    var proxy = new DrawingContextProxyHandler("<root context>")
    return new Proxy(softwareContext, proxy)
}

function getCanvasContext(height, width) {        
    var canvas = document.getElementById('real-canvas') as HTMLCanvasElement;
    var context = canvas.getContext('2d');
    canvas.height = height;
    canvas.width = width;
    return context
}

class ProxyHandler {
    path:any
    disabledProperties:{[name:string]:boolean} = {}

    constructor(path) {
        this.path = path
    }
    
    get(target:object, name:string) {
        let pathToProp = this.path + "." + name
        console.log("get " + pathToProp)

        if(this.disabledProperties[name]) return undefined

        let value:object

        if(!name.startsWith("_")) {
            value = target[name]
        }
        else {
            console.error("underscored private propery access attempt: " + name)
            console.error(target)
        }
        if(value !== undefined) {
            return value
        }
        var proxy = new ProxyHandler(pathToProp)
        return new Proxy(target, proxy)
    }

    set(target, name, value) {
        let pathToProp = this.path + "." + name
        console.log("set " + pathToProp, value)
        if(name.startsWith("_")) {
            console.error("underscored private propery access attempt: " + name)
            console.error(target)
        }
        return true
    }

    deleteProperty(target, name) {
        let pathToProp = this.path + "." + name
        console.log("delete " + pathToProp)
        return true
    }
}

class DrawingContextProxyHandler extends ProxyHandler {
    constructor(path:string) {
        super(path);
        //this.disabledProperties = {}
    }

    set(target, name, value) {
        super.set(target,name,value)
        let descriptor = Object.getOwnPropertyDescriptor(target,name)
        let fromPrototype = false
        if(descriptor == null) {
            descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target),name)
            if(descriptor != null) {
                fromPrototype = true
            }
        }
        if(descriptor != null && descriptor.set != null) {
            if(fromPrototype) {
                descriptor.set.call(target,value)            
            }
            else {
                descriptor.set(value)            
            }
        }
        else if(name.startsWith("_") && Object.prototype.hasOwnProperty(name)) {
            target[name] = value
        }
        else {
            console.warn(name + ": no setter")
        }
        return true
    }
    
}

interface IDrawingTextMeasurement {
    width:number   
}

interface IDrawingFont {
    stringToGlyphs: (string) => IDrawingGlyph[]
}

interface IDrawingGlyph {
    getBoundingBox:() => {x1:number,y1:number,x2:number,y2:number}
}

interface IDrawingTransform {
    
}

interface IOpenTypeGlyph {
    advanceWidth:number
    getBoundingBox:() => {x1:number,y1:number,x2:number,y2:number}
    draw:(ctx:CanvasRenderingContext2D,x:number,y:number,fontSize:number) => void
}

interface IOpentypeFont {
    stringToGlyphs: (string) => IOpenTypeGlyph[]
}

class WrappedOpenTypeFont implements IDrawingFont {
    font:IOpentypeFont
    constructor(font:IOpentypeFont) {
        this.font = font
    }

    stringToGlyphs(text:string):IDrawingGlyph[] {
        let glyphs = this.font.stringToGlyphs(text)
        let result = []
        for(let i = 0; i < glyphs.length; i++) {
            result.push(new WrappedOpenTypeGlyph(glyphs[i]))
        }
        return result
    }
}

class WrappedOpenTypeGlyph implements IDrawingGlyph {
    glyph:IOpenTypeGlyph    
    constructor(glyph:IOpenTypeGlyph) {
        this.glyph = glyph
    }

    getBoundingBox() {
        return this.glyph.getBoundingBox()
    }
}

class MozCurrentTransform implements IDrawingTransform {

    state = {
        transformMatrix: [1, 0, 0, 1, 0, 0]
    }    

    slice() {
        var instance = {}
        var proxy = new Proxy(instance, new ProxyHandler("slice"))
        return proxy
    }
}
