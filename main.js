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

        let circ = nodelist[[x,y]].append("circle")
        setattrs(circ, {
            "cx": x, "cy": y, "r": 25, 
            "fill": "white", 
            "stroke": "black",
            "stroke-width": 5,
            "fill-opacity": 0,
        })

        let labe = nodelist[[x,y]].append("text")
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

const N = 15;

for (let i = 0; i < N; i++) {
    new node(200 + 100 * Math.sin(2 * Math.PI * i / N), 
    200 - 100 * Math.cos(2 * Math.PI * i / N), String(i))
}


console.log(10)