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

let nodeisclicked = false;
function nodeClicked(thisid) {
    console.log("Node Selected: " + thisid)
    const findhtml = d3.select("#"+thisid).select("circle");
    clickqueue.push([Number(findhtml.attr("cx")),Number(findhtml.attr("cy")),"node"])
    nodeisclicked = true;
}

function midPoint(coord1,coord2) {
    return [(Number(coord1[0]) + Number(coord2[0]))/2, 
    (Number(coord1[1]) + Number(coord2[1]))/2];
}

function findNode(coord) {
    for (let curnode of Object.keys(adjlist)) {
        curnode = curnode.split(",")
        if (curnode[0] == coord[0] && curnode[1] == coord[1]) {
            return curnode;
        }
    }
}

function enterPressed() {
    processInput();
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
}

function escPressed() {
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
}

function delPressed() {
    processDeletion();
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
}

function helpPressed() {

}

const offset = 53
const space = d3.select("body")
const svg = space.append("svg")
setattrs(svg, {'width': window.innerWidth, 'height': window.innerHeight - offset})
svg.append("div").attr("id", "divider")

const circle = svg.append("circle")

setattrs(circle, {"r": 40, "fill": "red"})

animate((elapsed) => {
    setattrs(circle, {
        "cx": 800+100*Math.cos(2*Math.PI*elapsed/1000), 
        "cy": 200+100*Math.sin(2*Math.PI*elapsed/1000)})
    }, 2000)

nodelist = Object()
adjlist = Object()

class node {
    constructor(x, y, label) {
        this.coord = [x,y];
        this.label = label;
        
        adjlist[[x,y,label]] = [];

        nodelist[[x,y]] = svg.append("g")
        setattrs(nodelist[[x,y]], {
            "id": "node"+label,
            "onclick": "nodeClicked(this.id)",
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

class edge {
    constructor(node1, node2, label, arrow=true, weight=0, bend=0) {
        this.start = node1;
        this.end = node2;
        this.label = label;
        this.arrow = arrow;
        this.weight = weight;
        this.bend = bend;

        const thisedge = svg.insert("path", "#divider");
        
        adjlist[node1].push([node2, thisedge]);

        if (!arrow) {adjlist[node2].push([node1, thisedge])};

        const midpoint = midPoint(node1.slice(0,2), node2.slice(0,2))

        setattrs(thisedge, {
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
        clickqueue.push([nearestMultiple(event.x,50), nearestMultiple(event.y-offset,50), "empty"])
    }
    nodeisclicked = false;

    updateToolbarQueue();
    console.log(clickqueue)
})

d3.select("body").on('keydown', (event) => {
    
    if (event.key === "Enter") {
        enterPressed();
    } else if (event.key === "Escape") {
        escPressed();
    } else if (event.key === "Backspace") {
        delPressed();
    } else {
        inputstatus += event.key
    }
    console.log(inputstatus)
})

let autonodenumber = 1

function processInput() {
    if (clickqueue.length === 1) {
        if (inputstatus) {
            new node(clickqueue[0][0], clickqueue[0][1], inputstatus);
        } else {
            new node(clickqueue[0][0], clickqueue[0][1], autonodenumber);
            autonodenumber += 1;
        }
    }

    if (clickqueue.length === 2) {
        const start = findNode(clickqueue[0].slice(0,2));
        const end = findNode(clickqueue[1].slice(0,2));
        new edge(start, end, inputstatus);
    }
}

function processDeletion() {
    
}

function updateToolbarQueue() {
    d3.select("#clickqueue").remove() // remove clickqueue element
    queuebox = d3.select("#toolbarright") // reinsert new clickqueue element
                .append("div")
                .attr("id", "clickqueue")
                .attr("style", "float: right; margin: 0;")
                .attr("height", 43)
                .attr("width", 43)

    for (const curclick of clickqueue) {

        const elbox = queuebox.insert("svg", "svg")
                            .attr("height", 43).attr("width", 43)
                            .attr("style", "float: right; margin: 0;")

        if (curclick[2] == "empty") {
            for (const drawpath of ["M 16 6 L 6 6 L 6 16", "M 27 37 L 37 37 L 37 27", "M 27 6 L 37 6 L 37 16", "M 6 27 L 6 37 L 16 37"]) {
                elbox.append("path")
                    .attr("d", drawpath)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
            }
        }

        if (curclick[2] == "node") {
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
    }
}

const N = 10;

for (let i = 0; i < N; i++) {
    new node(200 + 100 * Math.sin(2 * Math.PI * i / N), 
    200 - 100 * Math.cos(2 * Math.PI * i / N), "a"+String(i))
}
