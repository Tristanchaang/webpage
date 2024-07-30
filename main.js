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

function processInput() {
    if (clickqueue && inputstatus) {
        new node(clickqueue[0][0], clickqueue[0][1], inputstatus)
    }
}

function nodeClicked() {
    console.log("Node Selected")
}

const space = d3.select("body")
const svg = space.append("svg")
setattrs(svg, {'width': window.innerWidth, 'height': window.innerHeight})
svg.append("div").attr("id", "divider")

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
        setattrs(nodelist[[x,y]], {
            "id": "node:"+label,
            "onclick": "nodeClicked()",
            "style": "cursor: pointer;"
        })

        const nodecirc = nodelist[[x,y]].append("circle")
        setattrs(nodecirc, {
            "cx": x, "cy": y, "r": 25, 
            "fill": "rgb(200,200,200)", 
            "stroke": "black",
            "stroke-width": 5,
        })

        const nodelabel = nodelist[[x,y]].append("text")
        nodelabel.text(String(label))
        setattrs(nodelabel, {
            "x": x, "y": y,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": 25,
            "font-family": "Arial, Helvetica, sans-serif",
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
        processInput();
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

svg.insert("path", "#divider")
    .attr("d", "M 100 350 Q 250 50 400 350")
    .attr("style", "fill:none; stroke:black; stroke-width:5;")

