import { gsap, Draggable } from "gsap/all";

export interface InputSetup {
    lineMin : number,
    lineMax : number,
    rangeNum : number,

    balloonURL : string,
    bagURL : string,

    plusBtn : SVGSVGElement, 
    minusBtn : SVGSVGElement, 
    platform : SVGSVGElement, 
    spring : SVGSVGElement, 

    balloon : SVGSVGElement, 
    sandbag : SVGSVGElement, 
    cart : SVGSVGElement, 
    backWheel : SVGSVGElement, 
    frontWheel : SVGSVGElement, 

    inputNums : HTMLElement,
    inputBtns : HTMLElement,

    playBtn : SVGSVGElement, 
    cover : SVGSVGElement, 

    equation : HTMLElement,
    terms : HTMLElement,
    addTerm : HTMLElement,
  
    numbers : SVGSVGElement,
}


export interface Game {
  startBalloons : number;
  startSandbags : number;
  leftHeight : number;
  rightHeight : number;
}

interface Node {
  el : HTMLElement;
  on : boolean;
  val : number 
}

interface Term  {
  el : HTMLElement;
  node : Node;
  positive : boolean;
  val : number;
  txt : HTMLElement;
  img : HTMLElement,
}


export function integerPlatfromAPI(setup, game) {
  let self;

  class IntegerPlatformClass {
    setup : InputSetup
    game : Game 
    sum : number
    pos : number
    items : Node[]

    defaultNodeStyle : string
    selectedNodeStyle : string 
    defaultTermStyle : string
    selectedTermStyle : string 
    positive : boolean

    tl : any

    itemStartX : number
    itemStartY : number

    selectedNode : Node | null 
    selectedTerm : Term | null
    termIndex : number
    allTerms : Term[]

    canOpenInput : boolean
    diff : number
    springStart : number

    wheelCircumference : number

    constructor() {
      self = this
      this.setup = setup
      this.game = game
      this.sum = 0
      this.pos = this.sum*13.3
      this.items = []

      this.defaultNodeStyle = "scroll-snap-align: center; display: flex; justify-content: center; align-items: center; background: #fff; border-radius: 8px; font-size : 20px; font-family : 'Poppins'; color:#000"
      this.selectedNodeStyle = "scroll-snap-align: center; display: flex; justify-content: center; align-items: center; background: #23a3ff; border-radius: 8px; font-size : 20px; font-family : 'Poppins'; color:#fff"
      this.defaultTermStyle = "scroll-snap-align: center; display: flex; justify-content: center; align-items: center; background: #fff; border-radius: 30px; font-size : 20px; font-family : 'Poppins'; color:#000"
      this.selectedTermStyle = "scroll-snap-align: center; display: flex; justify-content: center; align-items: center; background: #23a3ff; border-radius: 30px; font-size : 20px; font-family : 'Poppins'; color:#fff"
      
      
      this.positive = true

      this.tl = gsap.timeline();

      this.itemStartX = -400
      this.itemStartY = 50

      this.selectedNode = null
      this.selectedTerm = null 
      this.termIndex = -1
      this.allTerms = []

      this.canOpenInput = false

      //TO DO: FIX diff and 0.163
      this.diff = 450
      this.springStart = 0.175

      this.main()
    }

    openInput() {
      this.setPlusBtn()
      gsap.set(setup.cover, {visibility : "visible"})
      gsap.set(setup.inputBtns, {visibility : "visible"})
      gsap.set(setup.inputNums, {visibility : "visible"})

      self.canOpenInput = false;
    }

    closeInput() {
      gsap.set(setup.cover, {visibility : "hidden"})
      gsap.set(setup.inputBtns, {visibility : "hidden"})
      gsap.set(setup.inputNums, {visibility : "hidden"})

      
      //remove empty terms and space (for some reason needs to run twice)
      for(var j = 0; j < 2; j++) {
        for(var i = 0; i < self.allTerms.length; i++) {
          if (self.allTerms[i].val == 0) {
              setup.terms.removeChild(self.allTerms[i].el)
              self.allTerms.splice(i, 1)
          }
        }
      }

      if (self.selectedTerm != null) {
        self.selectedTerm.el.setAttribute("style", self.defaultTermStyle)
      }
      

      self.selectedTerm = null
      self.termIndex = -1

      //reset to no term selected 
      if (self.selectedNode != null) {
        self.selectedNode.el.setAttribute("style", self.defaultNodeStyle)
        self.selectedNode.on = false;
      }
      self.selectedNode = null
      self.canOpenInput = true;
    }

    addNewTerm() {
      self.selectedTerm = {
        el : document.createElement('li'), 
        node : null,
        positive : true,
        val : 0,
        txt : document.createTextNode("+0"),
        img : null,
      }

      self.selectedTerm.el.appendChild(self.selectedTerm.txt);
      self.selectedTerm.el.setAttribute("style", self.selectedTermStyle)
      setup.terms.appendChild(self.selectedTerm.el);

      self.termIndex = self.allTerms.length
      self.allTerms.push(self.selectedTerm)

      self.selectedTerm.el.onpointerdown = function(e) {
        if(self.canOpenInput) {
          self.openInput()
        }
        var oldIndex = self.termIndex

        //set selected term
        for(var i = 0; i < self.allTerms.length; i++) {
          if (self.allTerms[i].el == this) {
            self.termIndex = i
          }
        }

        if (oldIndex != self.termINdex) {
          if (self.selectedTerm != null) {
            self.selectedTerm.el.setAttribute("style", self.defaultTermStyle)
          }
        }
        self.selectedTerm = self.allTerms[self.termIndex]
        self.selectedTerm.el.setAttribute("style", self.selectedTermStyle)


        //change plus/minus
        if (self.selectedTerm.positive) 
          self.setPlusBtn()
        else self.setMinusBtn()

        //change selected node
        
        if (self.selectedNode != null ) {
          self.selectedNode.el.setAttribute("style", self.defaultNodeStyle )
          self.selectedNode.on = false
        }
        if (self.selectedTerm.node  != null ) {
          self.selectedNode = self.selectedTerm.node 
          self.selectedNode.el.setAttribute("style", self.selectedNodeStyle )
          self.selectedNode.on = true
        }
        else {
          self.selectedNode = null
        }

      }

      const list = document.querySelectorAll('.term'); 
      list.forEach(el => {
        const n = el.children.length;
        (el as HTMLElement).style.setProperty('--total', (n).toString());
        (el as HTMLElement).style.setProperty('--boxSize', (12).toString() +"vh");
      });
    }

    updateSize() {

      var width  = setup.cover.getBoundingClientRect().width
      var height = setup.cover.getBoundingClientRect().height

      gsap.set(setup.inputBtns, {x : 0.05*width, y : height*0.12})
      gsap.set(setup.inputNums, {x : 0.15*width, y : height*0.12})

      gsap.set(setup.equation, {x : 0.33*width, y : height*0.014})
      gsap.set(setup.addTerm, {x : 0.57*width, y : height*0.014})

    }

    main() {
      this.setupInputScrollbar()
      this.setupPlusMinus()
      this.setupDraggablePlatform()

      this.updateSize()
      addEventListener("resize", (e) => {this.updateSize()})

      //input 
      gsap.set(setup.inputBtns, {visibility : "hidden"})
      gsap.set(setup.inputNums, {visibility : "hidden"})

      setup.addTerm.onpointerdown = function(e) {
        if (self.canOpenInput) {
          self.openInput()
          self.addNewTerm()
        }
        else if (!self.tl.isActive()){
          self.closeInput()
          self.openInput()
          self.addNewTerm()
        }
      }

      setup.cover.onpointerdown = function(e) {
        self.closeInput()
      }

      //set up equation descriptor
      //gsap.set(setup.equation, {x : 420, y : 10})
      //gsap.set(setup.addTerm, {x : 730, y : 18})

      //play buttn 
      setup.playBtn.onpointerdown = function(e) {
        self.allTerms.forEach(x => {
          console.log(x)
          //TO DO: ANIMATE BALLOONS AND SANDBAGS          
        })
      }

      this.setupAnimation()

      /*
      function removeItems(node) {
        node.obj.forEach(el => {
          try {
          setup.platform.removeChild(el)
          }
          catch {

          }
        })
      }
      
      
      function addItems(node) {
        for(var i = 0; i < Math.abs(node.val); i++) {
          var temp;
          if (Number(node.val) < 0) {
            temp = setup.balloon.cloneNode(true);
            gsap.set(temp, {x : itemStartX + i * 15, y : itemStartY, visibility : "visible"})
          }
          else {
            temp = setup.sandbag.cloneNode(true)
            gsap.set(temp, {x : itemStartX + i * 15, y : itemStartY - 290, visibility : "visible"})
          }
         
          
          node.obj.push(temp)
          setup.platform.appendChild(temp)
        }
      }
      */
    }

    setupAnimation() {
      //set wheel attributes
      gsap.set(setup.backWheel, {transformOrigin:"50% 50%"})
      gsap.set(setup.frontWheel, {transformOrigin:"50% 50%"})
      self.wheelCircumference = 2*Math.PI*(setup.backWheel.getBBox().width / 2) //TO DO FIX SPEED
      //self.wheelCircumference = 2*Math.PI*((setup.backWheel as HTMLElement).getBoundingClientRect().width / 2) //TO DO FIX SPEED


      //TRY  gsap.getProperty(yourObject,"x") !!!!!!!!!!!!!!!!!!!!!!!!!

      //move cart to center
      // this.tl.to(setup.cart, {duration : 1})
      // this.tl.to(setup.cart, {x : 147, duration : 2, ease: "linear", 
      //   onUpdate : function() {
      //     const xVal = Math.round(gsap.getProperty(this.targets()[0], "x"));
      //     gsap.set(setup.backWheel, {rotation : xVal/self.wheelCircumference*360})
      //     gsap.set(setup.frontWheel, {rotation : xVal/self.wheelCircumference*360})
      //   }})
      //   this.tl.to(setup.cart, {duration : 0.1})
      
      this.tl.to(setup.cart, {duration : 1})
      this.tl.to(setup.cart, {x : 640, duration : 2, ease: "linear"})
      this.tl.to([setup.backWheel, setup.frontWheel], {rotation : 640 / self.wheelCircumference * 360, duration : 2, ease: "linear"}, "<")  //458
      //, onComplete : function() {
      //   console.log("wheel 1 " + (setup.backWheel as HTMLElement).getBoundingClientRect().x) // = 15
      // }, onStart : function() {
      //   console.log("wheel 2 " + (setup.backWheel as HTMLElement).getBoundingClientRect().x) = 473
      // }
        
      this.tl.to(setup.cart, {duration : 0.1})
      

      //update platform position
      self.sum = 1
      self.updatePlatformPos()

      //add start balloons 
      var balloons = []
      for(var i = 0; i < self.game.startBalloons; i++) {
        var temp = setup.balloon.cloneNode(true);
        gsap.set(temp, {x : self.itemStartX + i * 15, y : self.itemStartY + 200, visibility : "visible"})
        setup.platform.appendChild(temp)
        balloons.push(temp)
      }

      var sandbags = []
      for(var i = 0; i < self.game.startSandbags; i++) {
        var temp = setup.sandbag.cloneNode(true);
        gsap.set(temp, {x : self.itemStartX + i * 15, y : self.itemStartY - 500, visibility : "visible"})
        setup.platform.appendChild(temp)
        sandbags.push(temp)
      }

      this.tl.to(balloons, {y : self.itemStartY, 
        onComplete : function() {
          self.sum -= self.game.startBalloons
          self.updatePlatformPos()
          
          self.tl.to(sandbags, {y : self.itemStartY - 292, 
            onComplete : function() {
              self.sum += self.game.startSandbags
              self.updatePlatformPos()
              self.canOpenInput = true
              
            }})
        }})
    
      
    }

    updatePlatformPos() {
      self.pos = self.sum*13.3
      this.tl.to(setup.platform, {y : self.pos, ease : "elastic", duration : 1,
        onUpdate : function() {
          const yVal = Math.round(gsap.getProperty(this.targets()[0], "y"));
          gsap.set(setup.spring, {scaleY : -yVal/self.diff + self.springStart })
        }
      })
    }

    setupInputScrollbar() {
      for(var i = Number(setup.lineMin); i < Number(setup.lineMax)+1; i++) {

        if (i != 0) {
          var n = document.createElement('li');
          n.appendChild(document.createTextNode(Math.abs(i).toString()));
  
          var s = document.createElement('img')
          if (i < 0) s.src = setup.balloonURL
          if (i > 0) s.src = setup.bagURL
          n.appendChild(s)
  
          n.setAttribute("style", self.defaultNodeStyle)
          setup.numbers.appendChild(n);
   
          (this.items).push({el : n, on : false, val : i})
        }
    
      }
      
      const list = document.querySelectorAll('.num'); 
      list.forEach(el => {
        const n = el.children.length;
        (el as HTMLElement).style.setProperty('--total', n.toString());
        (el as HTMLElement).style.setProperty('--boxSize', (8).toString() +"vh");
      });
  
      //CLICK ON NUMBERS 
      this.items.forEach(node => {
        (node.el).onpointerdown = function (e) {
          if (self.selectedNode != null && self.selectedNode != node) {
            self.selectedNode.el.setAttribute("style", self.defaultNodeStyle )
            self.selectedNode.on = false
          }
  
          if(!node.on) {
            node.el.setAttribute("style", self.selectedNodeStyle )
            node.on = true
  
            self.selectedNode = node

            self.selectedTerm.node = node
            self.selectedTerm.val = node.val
            self.selectedTerm.el.removeChild(self.selectedTerm.txt);
            if (self.selectedTerm.img != null)
              self.selectedTerm.el.removeChild(self.selectedTerm.img);
  
            if (self.positive) {
              var str = "+" + Math.abs(self.selectedTerm.val).toString()
            }
            else  {
              var str = "-" + Math.abs(self.selectedTerm.val).toString()
            }
            self.selectedTerm.txt = document.createTextNode(str)
            self.selectedTerm.el.appendChild(self.selectedTerm.txt);
  
            
            var s = document.createElement('img')
            if (node.val < 0)  s.src = setup.balloonURL
            else  s.src = setup.bagURL
            self.selectedTerm.img = s
            self.selectedTerm.el.appendChild(s)
          }
          else {
            node.el.setAttribute("style", self.defaultNodeStyle )
            node.on = false
  
            self.selectedNode = null
            self.selectedTerm.node = null
            self.selectedTerm.el.removeChild(self.selectedTerm.txt);
            self.selectedTerm.el.removeChild(self.selectedTerm.img);
  
            self.selectedTerm.img = null
            self.selectedTerm.val = 0
  
            if (self.selectedTerm.positive) {
              var str = "+" + self.selectedTerm.val.toString()
            }
            else  {
              var str = "-" + self.selectedTerm.val.toString()
            }
            self.selectedTerm.txt = document.createTextNode(str)
            self.selectedTerm.el.appendChild(self.selectedTerm.txt);
  
  
          }
        
        }
      });
    }

    setupPlusMinus() {
      //INITIALIZE TO POSITIVE
      gsap.set(setup.plusBtn, {stroke : "#fff"})

      setup.plusBtn.onpointerdown = function(e) {
        if (self.positive == false) {
          self.setPlusBtn()
        }
      }

      setup.minusBtn.onpointerdown = function(e) {
        if (self.positive) {
          self.setMinusBtn()
        }
      }
    }

    setPlusBtn() {
      gsap.set(setup.plusBtn, {stroke : "#fff"})
      gsap.set(setup.minusBtn, {stroke : "#23a3ff"})

      if(self.selectedTerm != null) {
        self.selectedTerm.positive = true
        self.selectedTerm.txt.textContent = "+"+Math.abs(self.selectedTerm.val).toString()
      }
      self.positive = true
    }

    setMinusBtn() {
      gsap.set(setup.minusBtn, {stroke : "#fff"})
      gsap.set(setup.plusBtn, {stroke : "#23a3ff"})        

      self.selectedTerm.positive = false
      self.selectedTerm.txt.textContent = "-"+Math.abs(self.selectedTerm.val).toString()
      self.positive = false
    }

    setupDraggablePlatform() {
      //MOVE SPRING AND PLATFORM
      gsap.set(setup.spring, {transformOrigin: "bottom"})
      gsap.set(setup.spring, {scaleY : -self.pos/self.diff + self.springStart})
      gsap.set(setup.platform, {y : self.pos})
      gsap.registerPlugin(Draggable);
      
      Draggable.create(setup.platform, {type : "y", 
        onDrag : function() { 
          gsap.set(setup.spring, {scaleY : -this.y/self.diff + self.springStart})
        }, 
        onDragEnd : function () {
          gsap.to(setup.platform, {y : self.pos, ease : "elastic", duration : 1, 
            onUpdate : function() {
              const yVal = Math.round(gsap.getProperty(this.targets()[0], "y"));
              gsap.set(setup.spring, {scaleY : -yVal/self.diff + self.springStart })
            } 
          }) 
        }})

    }
  }
  
  self  = new IntegerPlatformClass

}
    
    


