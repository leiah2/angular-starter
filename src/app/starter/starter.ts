import { gsap } from "gsap/all";
import {svgns} from "../api"

export class StarterAPI {
    arena : HTMLElement;
    rect : HTMLElement; 
    anotherRect : SVGUseElement;

    tl : any

    constructor(setup) {
        this.arena = setup.arena
        this.rect = setup.rect
        this.tl = gsap.timeline()

        this.init()
        this.animate()
    }

    init() {
        this.anotherRect = document.createElementNS(svgns,"use")
        this.arena.appendChild(this.anotherRect)
        this.anotherRect.setAttribute("href","#rectImg")
        gsap.set(this.anotherRect, {x : 125, y : 25})

    }

    animate() {
        this.tl.to(this.anotherRect, { duration : 1 }) //pause
        this.tl.to(this.anotherRect, { x : 200, duration : 1, ease :  "linear" })
        this.tl.to(this.anotherRect, { duration : 1 }) //pause
        this.tl.to(this.rect, { scaleX : 3 })

    }
}

