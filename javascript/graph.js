function changeattr(shapelist,prop,val) {
    for (let shape of shapelist) shape.attr(prop, val);
}

function setattrs(shape, dict) {
    for (let [prop, val] of Object.entries(dict)) shape.attr(prop, val);
}

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}

function nearestMultiple(num, mul) {return Math.round(num/mul) * mul}

let nodeisclicked = false;
function nodeClicked(thisid) {
    // console.log("Node Selected: " + thisid)
    const findhtml = d3.select("#"+thisid).select("circle");
    clickqueue.push(["node",Number(findhtml.attr("cx")),Number(findhtml.attr("cy"))])
    nodeisclicked = true;
}

let edgeisclicked = false;
function edgeClicked(thisid) {
    // console.log("Node Selected: " + thisid)
    const findhtml = d3.select("#"+thisid).select("circle");
    clickqueue.push(["edge",Number(findhtml.attr("cx")),Number(findhtml.attr("cy"))])
    nodeisclicked = true;
}

function midPoint(coord1,coord2) {
    return [(Number(coord1[0]) + Number(coord2[0]))/2, 
    (Number(coord1[1]) + Number(coord2[1]))/2];
}


function pressed(key) {
    switch (key) {
        case "Enter": processInput(); break;
        case "Backspace": processDeletion(); break;
    }
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
}

function helpPressed() {
    d3.select("#tutorial").attr("class", "active")
    d3.select("#overlay").attr("class", "active")
}

function closeTutorial() {
    d3.select("#tutorial").attr("class", "")
    d3.select("#overlay").attr("class", "")
}

const offset = document.getElementById("toppart").offsetHeight;
const svg = d3.select("body").insert("svg", "#tutorial");
setattrs(svg, {
    'width': window.innerWidth, 
    'height': window.innerHeight - offset,
    'style': "top: " + offset + "px; position: fixed;",
});
svg.append("div").attr("id", "divider");

nodelist = Object() // {[x,y]: d3objectrepresentation, ...}
adjlist = Object() // {[x,y]: [[neighbours, ...], label], ...}

class node {
    constructor(x, y, label) {
        this.coord = [x,y];
        this.label = label;
        
        adjlist[[x,y]] = [[], label];

        nodelist[[x,y]] = svg.append("g");

        setattrs(nodelist[[x,y]], {
            "id": "node-"+String(x)+"-"+String(y),
            "onclick": "nodeClicked(this.id)",
            "style": "cursor: pointer;"
        })

        const nodecirc = nodelist[[x,y]].append("circle")
        setattrs(nodecirc, {
            "cx": x, "cy": y, "r": 25, 
            "fill": "rgb(200,200,200)", 
            "stroke": "black",
            "stroke-width": 5,
            "class": "nodecircle"
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

class edge {
    constructor(node1, node2, label, arrow=true, weight=0, bend=0) {
        this.start = node1;
        this.end = node2;
        this.label = label;
        this.arrow = arrow;
        this.weight = weight;
        this.bend = bend;

        const thisedge = svg.insert("g", "#divider")
                            .attr("id", "edge-"+String(node1[0])+"-"+String(node1[1])+"-"+String(node2[0])+"-"+String(node2[1]))
                            .attr("onclick", "edgeClicked()")
                            .attr("style", "cursor: pointer;")
        
        adjlist[node1][0].push([node2, thisedge]);

        if (!arrow) {adjlist[node2][0].push([node1, thisedge])};

        const midpoint = midPoint(node1.slice(0,2), node2.slice(0,2))


        setattrs(thisedge.append("path"), {
            "style": "fill:none; stroke:black; stroke-width:5;",
            "d": "M " + node1[0] + " " + node1[1] 
            + " Q " + midpoint[0] + " " + midpoint[1] 
            + " " + node2[0] + " " + node2[1] 
            + "",
        })
    }
}

let clickqueue = [];
let inputstatus = "";

svg.on('click', (event) => {
    if (!nodeisclicked) {
        clickqueue.push(["empty",nearestMultiple(event.x,50), nearestMultiple(event.y-offset,50)])
    }
    nodeisclicked = false;

    updateToolbarQueue();
    // console.log(clickqueue)
})

d3.select("body").on('keydown', (event) => {

    if (["Enter", "Escape", "Backspace", "Shift"].includes(event.key)) {
        pressed(event.key);
    } else {
        inputstatus += event.key;
    }

    // console.log(inputstatus)
})

let autonodenumber = 1

function processInput() {

    for (let queueEl of clickqueue) {
        if (queueEl[0] === "empty") {
            let nodename;
            if (inputstatus) {
                nodename = inputstatus;
            } else {
                nodename = autonodenumber++;
            }
            new node(queueEl[1], queueEl[2], nodename);
        }
    }

    if (clickqueue.length === 1 && clickqueue[0][0] === "node") {
        let nodename;
        if (inputstatus) {
            nodename = inputstatus;
        } else {
            nodename = autonodenumber++;
        }
        const orilabel = adjlist[[clickqueue[0][1], clickqueue[0][2]]][1];
        d3.select("#node"+orilabel).select("text").text(nodename);
        adjlist[[clickqueue[0][1], clickqueue[0][2]]][1] = nodename;
    }

    if (clickqueue.length > 1) {
        for (let i=0; i<clickqueue.length-1; i++) {
            if (clickqueue[i][0] === "node" && clickqueue[i+1][0] === "node") {
                new edge(clickqueue[i].slice(1,3), clickqueue[i+1].slice(1,3), inputstatus)}
        }
    }
}

function processDeletion() {
    for (const curobj of clickqueue) {
        d3.select("#"+"node-"+String(curobj[1])+"-"+String(curobj[2])).remove()
    }
}

function updateToolbarQueue() {
    d3.select("#clickqueue").remove() // remove clickqueue element
    queuebox = d3.select("#toolbar") // reinsert new clickqueue element
                .append("div")
                .attr("id", "clickqueue")
                .attr("style", "float: right; margin: 0;")
                .attr("height", 43)
                .attr("width", 43)

    for (const curclick of clickqueue) {

        const elbox = queuebox.insert("svg", "svg")
                            .attr("height", 43).attr("width", 43)
                            .attr("style", "float: right; margin: 0;")

        if (curclick[0] == "empty") {
            for (const drawpath of ["M 16 6 L 6 6 L 6 16", "M 27 37 L 37 37 L 37 27", "M 27 6 L 37 6 L 37 16", "M 6 27 L 6 37 L 16 37"]) {
                elbox.append("path")
                    .attr("d", drawpath)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
            }
        }

        if (curclick[0] == "node") {
            elbox.append("path")
                .attr("d", ["M 37 6 L 6 37"])
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
            elbox.append("circle")
                .attr("cx", 21.5).attr("cy", 21.5).attr("r", 15)
                .attr("fill", "rgb(200,200,200)")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
        }

        elbox.append("animateMotion")
            .attr("path", "m43,0 l -43,0")
            .attr("begin","0s")
            .attr("dur", "0.2s")
            .attr("repeatCount", 1)
    }
}

const N = 5, M = 10;

for (let i = 0; i < N; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / N)), 
    Math.round(200 - 100 * Math.cos(2 * Math.PI * i / N)), "a"+String(i))
}

for (let i = 0; i < M; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / M)), 
    Math.round(500 - 100 * Math.cos(2 * Math.PI * i / M)), "b"+String(i))
}

animate(0, Infinity,
    (elapsed) => {
        d3.selectAll(".nodecircle")
            .attr("r",25 + 3*Math.sin(elapsed/500))
    }
)

