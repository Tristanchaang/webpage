function changeattr(shapelist,prop,val) {
    for (let shape of shapelist) {
        shape.attr(prop, val)
    }
}

function setattrs(shape, dict) {
    for (let [prop, val] of Object.entries(dict)) {
        shape.attr(prop, val)
    }
}

function animate(func, duration, delay=0) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}

function nearestMultiple(num, mul) {
    return Math.round(num/mul) * mul
}

const space = d3.select("#app")
const svg = space.append("svg")
setattrs(svg, {'width': window.innerWidth, 'height': window.innerHeight})

const circle = svg.append("circle")

setattrs(circle, {"r": 40, "fill": "red"})

animate((elapsed) => {
    setattrs(circle, {
        "cx": 800+100*Math.cos(2*Math.PI*elapsed/1000), 
        "cy": 200+100*Math.sin(2*Math.PI*elapsed/1000)})
    }, 2000)

nodelist = Object()

class node {
    constructor(x, y, label) {
        this.coord = [x,y];
        this.label = label;
        
        nodelist[[x,y]] = svg.append("g")
        nodelist[[x,y]].attr("id", "node:"+label)

        const clicker = nodelist[[x,y]].append("a")
        setattrs(clicker.append("circle"), {
            "cx": x, "cy": y, "r": 25, 
            "fill": "black", 
            "stroke": "black",
            "stroke-width": 5,
            "fill-opacity": 0.2
        })
        setattrs(clicker, {
            "onclick": "nodeclicked()",
            "style": "cursor: pointer;"
        })

        const labe = nodelist[[x,y]].insert("text", "a")
        labe.text(String(label))
        setattrs(labe, {
            "x": x, "y": y,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": 25,
            // "font-family": "Arial, Helvetica, sans-serif",
            "font-weight": "bold"
        })
    }
}

const N = 5;

for (let i = 0; i < N; i++) {
    new node(200 + 100 * Math.sin(2 * Math.PI * i / N), 
    200 - 100 * Math.cos(2 * Math.PI * i / N), String(i))
}

let clickqueue = [];
let inputstatus = "";

svg.on('click', (event) => {
    clickqueue.push([nearestMultiple(event.x,50), nearestMultiple(event.y,50)])
    console.log(clickqueue)
})

d3.select("body").on('keydown', (event) => {
    
    if (event.key === "Enter") {
        processinput();
        inputstatus = "";
        clickqueue = [];
    } else if (event.key === "Escape") {
        inputstatus = "";
        clickqueue = []
    } else {
        inputstatus += event.key
    }
    console.log(inputstatus)
})

function processinput() {
    if (clickqueue && inputstatus) {
        new node(clickqueue[0][0], clickqueue[0][1], inputstatus)
    }
}

function nodeclicked() {
    console.log("Node Selected")
}
