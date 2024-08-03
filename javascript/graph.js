// Major Turn Point: Implement Simple Node Code and Edge Code.
// Implementing DONE

/////////////////////
// Math Operations //
/////////////////////

function nearestMultiple(num, mul) {
    return Math.round(num/mul) * mul
}

function midPoint(coord1,coord2, bend = 0) {
    const a = Number(coord1[0]), b = Number(coord1[1]);
    const c = Number(coord2[0]), d = Number(coord2[1]);
    return [0.5 *a + 0.01 *b*bend - 0.01* bend *d + 0.5* c, -0.01* a*bend + 0.01 *c*bend + 0.5*b + 0.5 *d]
}

/////////////////////
// Buttons Pressed //
/////////////////////

let nodeisclicked = false;
function nodeClicked(thisid) { // thisid: "node-1"
    clickqueue.push(thisid);
    nodeisclicked = true;
}

let edgeisclicked = false;
function edgeClicked(thisid) { // thisid: "edge-1"
    clickqueue.push(thisid);
    edgeisclicked = true;
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

function settingsPressed() {
    d3.select("#settings").attr("class", "active")
    d3.select("#overlay").attr("class", "active")
}

function closeSettings() {
    d3.select("#settings").attr("class", "")
    d3.select("#overlay").attr("class", "")
}

//////////////
// Shorcuts //
//////////////

function clearCanvas() {
    adjlist = Object();
    svg.selectAll("g").remove();
    autonodenumber = 1;
    autoedgenumber = 1;
}


////////////////////
// Load/Save File //
////////////////////

let toLoad;
function loadFile() {
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
    d3.select("#inputstatusbox").text(inputstatus);
    const [file] = document.getElementById("loadFile").files;
    const reader = new FileReader();
  
    reader.addEventListener(
      "load",
      () => {

        clearCanvas();

        toLoad = reader.result;
        for (const obj of toLoad.split(";")) {
            // console.log(obj);
            let freshobj = obj.split(",");
            if (freshobj[0] == "node") {
                new node(freshobj[1], freshobj[2], freshobj[3]);
            }
            if (freshobj[0] == "edge") {
                new edge(freshobj[1], freshobj[2], freshobj[3], freshobj[4], freshobj[5]);
            }
        }
      }, false,
    );
  
    if (file) {
      reader.readAsText(file);
    }
    
  }

function saveFile() {
    inputstatus = "";
    clickqueue = [];
    updateToolbarQueue();
    d3.select("#inputstatusbox").text(inputstatus);
    const nodeRecord = [];
    const edgeRecord = [];
    const visitedEdges = [];

    for (const nodexy of Object.keys(adjlist)) {
        nodeRecord.push([Number(nodexy.slice(5)),getProp(nodexy,"coord").join(",") + "," + getProp(nodexy,"label") + ";"]);
    }

    nodeRecord.sort((a,b)=>(a[0]-b[0]));

    const ascendingIDs = [];
    for (const thing of nodeRecord) {
        ascendingIDs.push(thing[0]);
    }

    function oldToNew(no) {
        return Number(ascendingIDs.findIndex((x)=>(x==no)))+1;
    }

    for (const nodexy of Object.keys(adjlist)) {
        for (const edgeobj of adjlist[nodexy]) {
            const edgeid = edgeobj[1];
            if (!visitedEdges.includes(edgeid)) {
                const newstart = oldToNew(Number(getProp(edgeid, "start").slice(5)));
                const newend = oldToNew(Number(getProp(edgeid, "end").slice(5)));
                edgeRecord.push("node-" + newstart + ","
                        + "node-" + newend + ","
                        + getProp(edgeid, "arrow") + ","
                        + getProp(edgeid, "weight") + ","
                        + getProp(edgeid, "bend")+";");
                visitedEdges.push(edgeid)
            }
            
        }
    }

    let toSave = "";

    for (const thing of nodeRecord) {
        toSave+="node,"+thing[1];
    }
    for (const thing of edgeRecord) {
        toSave+="edge,"+thing;
    }


    let element = document.createElement('a');
    let filename = document.getElementById('saveFileName').value
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(toSave));
    element.setAttribute('download', filename+'.csv');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    inputstatus = "";
    clickqueue = [];
}

//////////////////////
// Background Setup //
//////////////////////

const offset = document.getElementById("toppart").offsetHeight;
const svg = d3.select("body").insert("svg", "#tutorial")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight - offset)
                .attr("style", "top: "+offset+"px; position: fixed;")

svg.append("div").attr("id", "divider"); // divide edges and nodes

////////////////////
// Object Classes //
////////////////////

adjlist = Object() // {"node",x,y: [neighbours, ...], ...}

let nodeColor = 'lightgray';
let autonodenumber = 1;

class node {
    constructor(x, y, label) {
        
        adjlist["node-"+autonodenumber] = [];

        const shapegroup = svg.append("g")
                            .attr("id", "node-"+autonodenumber)
                            .attr("onclick", "nodeClicked(this.id)")
                            .attr("style", "cursor: pointer;")

        shapegroup.append("circle")
                .attr("cx", x).attr("cy", y).attr("r", 25)
                .attr("fill", nodeColor).attr("stroke", "black")
                .attr("stroke-width", 5).attr("class", "nodeCircle")

        shapegroup.append("text")
                .text(String(label))
                .attr("x", x).attr("y", y).attr("text-anchor", "middle")
                .attr("dominant-baseline", "central").attr("font-size", 25)
                .attr("font-family", "Arial, Helvetica, sans-serif")
                .attr("font-weight", "bold")
        
        autonodenumber++;
    }
}

let autoedgenumber = 1;

class edge {
    constructor(node1, node2, arrow=0, weight=0, bend=0) {

        const thisid = "edge-"+autoedgenumber;
        // edge representation: ["edge",x1,y1,x2,y2,label, arrow, w, b]
        const thisedge = svg.insert("g", "#divider")
                            .attr("id", thisid)
                            .attr("onclick", "edgeClicked(this.id)")
                            .attr("start", node1)
                            .attr("end", node2)
                            .attr("style", "cursor: pointer;")
                            .attr("arrow", arrow)
                            .attr("weight", weight)
                            .attr("bend", bend)

        adjlist[node1].push([node2, thisid]);

        if (arrow==0) {adjlist[node2].push([node1, thisid])};

        const [x1y1, x2y2] = [getProp(node1,"coord"), getProp(node2,"coord")];
        const midpoint = midPoint(x1y1, x2y2, bend);

        thisedge.append("path")
            .attr("style", "fill:none; stroke:black; stroke-width:10;")
            .attr("d", "M " + x1y1.join(" ")
            + " Q " + midpoint[0] + " " + midpoint[1] 
            + " " + x2y2.join(" ")
            + "")
            .attr("class", "edgepath")
        
        autoedgenumber++;
    }
}

let clickqueue = [];
let inputstatus = "";

/////////////////////
// Key/Click Event //
/////////////////////

svg.on('click', (event) => {
    if (!nodeisclicked && !edgeisclicked) {
        clickqueue.push("empty-"+nearestMultiple(event.x,50)+"-"+nearestMultiple(event.y-offset,50))
    }
    nodeisclicked = false;
    edgeisclicked = false;

    updateToolbarQueue();
    // console.log(clickqueue) // uncomment to show real clickqueue
})

d3.select("body").on('keydown', (event) => {

    if (["Enter", "Escape", "Backspace", "Shift", "Control"].includes(event.key)) {
        pressed(event.key);
    } else {
        inputstatus += event.key;
    }

    d3.select("#inputstatusbox").text(inputstatus);
})

////////////////
// Processing //
////////////////

let unknownlabelcounter = 1;

function processInput() {

    for (let queueEl of clickqueue) {
        queueEl = queueEl.split("-")
        if (queueEl[0] === "empty") {
            let nodename;
            if (inputstatus) {
                nodename = inputstatus;
            } else {
                nodename = unknownlabelcounter++;
            }
            new node(queueEl[1], queueEl[2], nodename);
        }
    }

    if (clickqueue.length === 1 && clickqueue[0].slice(0,4) === "node") {
        let nodename;
        if (inputstatus) {
            nodename = inputstatus;
        } else {
            nodename = unknownlabelcounter++;
        }
        d3.select("#"+clickqueue[0]).select("text").text(nodename);
    }

    if (clickqueue.length > 1) {

        let arrow=0, weight=0, bend=0;
        for (const parsed of inputstatus.split(",")) {
            if (parsed=="dir") arrow=1;
            if (parsed.slice(0,2)=="w=") weight=Number(parsed.slice(2));
            if (parsed.slice(0,2)=="b=") bend=Number(parsed.slice(2));
        }

        for (let i=0; i<clickqueue.length-1; i++) {
            if (clickqueue[i].slice(0,4) === "node" && clickqueue[i+1].slice(0,4) === "node") {
                new edge(clickqueue[i], clickqueue[i+1], arrow, weight, bend)
            }
        }
    }
}

function processDeletion() {
    for (const curobj of clickqueue) {
        deleteObj(curobj);
    }
}

function updateToolbarQueue() {
    d3.select("#clickqueue").remove() // remove clickqueue html
    queuebox = d3.select("#toolbar") // reinsert new clickqueue html
                .append("div")
                .attr("id", "clickqueue")
                .attr("style", "float: right; margin: 0;")
                .attr("height", 43)
                .attr("width", 43)

    for (const curclick of clickqueue) {

        const shapetype = curclick.split("-")[0];

        const elbox = queuebox.insert("svg", "svg")
                            .attr("height", 43).attr("width", 43)
                            .attr("style", "float: right; margin: 0;")

        if (shapetype == "empty") {
            for (const drawpath of ["M 16 6 L 6 6 L 6 16", "M 27 37 L 37 37 L 37 27", "M 27 6 L 37 6 L 37 16", "M 6 27 L 6 37 L 16 37"]) {
                elbox.append("path")
                    .attr("d", drawpath)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
            }
        }

        if (shapetype == "node") {
            elbox.append("path")
                .attr("d", ["M 37 6 L 6 37"])
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
            elbox.append("circle")
                .attr("cx", 21.5).attr("cy", 21.5).attr("r", 15)
                .attr("fill", nodeColor)
                .attr("stroke", "black")
                .attr("stroke-width", 3)
        }

        if (shapetype == "edge") {
            elbox.append("path")
                .attr("d", ["M 35 8 L 8 35"])
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
            elbox.append("circle")
                .attr("cx", 35).attr("cy", 8).attr("r", 4)
                .attr("fill", "black")
            elbox.append("circle")
                .attr("cx", 8).attr("cy", 35).attr("r", 4)
                .attr("fill", "black")
        }
    }
}

//////////////
// Settings //
//////////////

let breathing = true;

function toggleBreathing() {
    breathing = !breathing;
    d3.select("#toggleBreathing")
        .attr("class", "toggler "+(breathing ? "on" : "off"))
        .text(breathing ? "On" : "Off");
}

const defaultNodeColor = "lightgray"

const nodeColorOptions = [
    defaultNodeColor,
    "pink",
    "lightblue",
    "lightgreen",
    "white",
]

for (const color of nodeColorOptions) {
    d3.select("#nodeColorOptions")
        .append("button")
        .attr("style", "background-color: " + color + ";")
        .attr("class", "selector nodeColor off")
        .attr("id", "nodeColor-"+color)
        .attr("onclick", "setNodeColor('"+color+"')")
        .text("\xa0")
}

d3.select("#nodeColor-"+defaultNodeColor).attr("class", "selector nodeColor on")

////////////////
// Animations //
////////////////

function animate(delay, duration, func) {
    let t = d3.timer((elapsed) => {
        func(elapsed);
        if (elapsed >= duration) {t.stop();}
        }, delay)
}

animate(0, Infinity,
    (elapsed) => {
        if (breathing) {
            d3.selectAll(".nodeCircle")
                .attr("r",25 + 3*Math.sin(elapsed/500));
            d3.selectAll(".edgepath")
                .attr("style", "fill: none; stroke: black; stroke-width: " + (10 + 2*Math.sin(elapsed/500)) + ";")
        } else {
            d3.selectAll(".nodeCircle")
                .attr("r",25);
            d3.selectAll(".edgepath")
                .attr("style", "fill: none; stroke: black; stroke-width: 10;")
        }
    }
)

///////////////////////
// Object Operations //
///////////////////////

function deleteObj(thing) {
    if (thing.slice(0,4) === "node") {
        for (const nodeedge of adjlist[thing]) {
            d3.select("#"+nodeedge[1]).remove();
        }
        delete adjlist[thing];

        for (const nodeid of Object.keys(adjlist)) {
            adjlist[nodeid] = adjlist[nodeid].filter((nodeedge) => {
                return !(nodeedge[0] === thing)
            })
        }
    }

    if (thing.slice(0,4) === "edge") {
        for (const nodeid of Object.keys(adjlist)) {
            adjlist[nodeid] = adjlist[nodeid].filter((nodeedge) => {
                return !(nodeedge[1] === thing)
            })
        }
    }

    d3.select("#"+thing).remove();
}

function setNodeColor(color) {
    d3.selectAll(".nodeColor").attr("class", "selector nodeColor off");
    d3.select("#nodeColor-"+color).attr("class", "selector nodeColor on");
    nodeColor = color;
    d3.selectAll(".nodeCircle").style("fill", color)
}

function moveNode(node1, coord) {
    // edit html


    // edit
}

function getProp(thingID, property) {
    const target = d3.select("#"+thingID);
    let pathparse;
    switch (property) {
        case "coord": // for nodes
            return [target.select("circle").attr("cx"), 
                    target.select("circle").attr("cy")];
        case "label": // for nodes
            return target.select("text").text();
    }

    try {
        return target.attr(property);
    } catch(err) {
        return;
    }

}

//////////////////
// Manual Input //
//////////////////

const N = 5, M = 8;

for (let i = 0; i < N; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / N)), 
    Math.round(200 - 100 * Math.cos(2 * Math.PI * i / N)), "a"+String(i))
}

for (let i = 0; i < M; i++) {
    new node(Math.round(200 + 100 * Math.sin(2 * Math.PI * i / M)), 
    Math.round(500 - 100 * Math.cos(2 * Math.PI * i / M)), "b"+String(i))
}