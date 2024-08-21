function changeattr(shapelist,prop,val) {
    for (let shape of shapelist) {shape.attr(prop, val)}
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

const svg = d3.select('#app').append('svg');
setattrs(svg, {'width': window.innerWidth, 'height': window.innerHeight});

const hi = svg.append('polygon')
const hi2 = svg.append('polygon')
const hi3 = svg.append('polygon')

let toggleclick = true;

setattrs(hi, {
    'points': '100,100 150,100 150,200 250,200 250,350 200,350 200,250 150,250 150,350 100,350',
    'fill-opacity': 1
})
hi2.attr('points', '300,200 350,200 350,350 300,350')
hi3.attr('points', '300,100 350,100 350,150 300,150')

const circle = svg.append('circle');
setattrs(circle, {'r': 30, 'fill': 'red'});

const circle2 = svg.append('circle');
setattrs(circle2, {'r': 30, 'fill': 'blue'});

const circle3 = svg.append('circle');
setattrs(circle3, {'r': 30, 'fill': 'lime', 'cx':400, 'cy':400});

const circle3mask = svg.append('circle');
setattrs(circle3mask, {'r': 80, 'fill-opacity': 0, 'cx':400, 'cy':400});

svg.on('mousemove', (event) => {
    circle.attr('cx', event.x);
    circle.attr('cy', event.y);
});

let fadespeed = 1
let movespeed = 1

svg.on('click', (event) => {
    
    if (toggleclick) {
        animate((elapsed) => {
            changeattr([hi,hi2,hi3],'fill-opacity', 1-elapsed/(2000/fadespeed));
            }, 2000/fadespeed)
        toggleclick = false;
    } else {
        animate((elapsed) => {
            changeattr([hi,hi2,hi3],'fill-opacity', elapsed/(2000/fadespeed));
            }, 2000/fadespeed)
        toggleclick = true;
    }

    let newx = event.x;
    let newy = event.y;
    let curx = circle2.attr('cx');
    let cury = circle2.attr('cy');
    let dx = newx-curx;
    let dy = newy-cury;
    let dist = (dx**2 + dy**2)**0.5;

    animate((elapsed) => {
        circle2.attr('cx', curx * (1-elapsed * movespeed /dist) + newx * elapsed * movespeed /dist)
        circle2.attr('cy', cury * (1-elapsed * movespeed /dist) + newy * elapsed * movespeed /dist)
    },dist/(movespeed))

    circle2.attr('cx', newx);
    circle2.attr('cy', newy);
})

d3.select("body").on('keydown', (event) => {
    console.log(event);
})

circle3mask.on('mouseover', (event) => {
    let curx = circle3.attr('cx')
    let cury = circle3.attr('cy')
    let newx = curx * 2 - 1 * event.x
    let newy = cury * 2 - 1 * event.y
    let dx = newx-curx;
    let dy = newy-cury;
    let dist = (dx**2 + dy**2)**0.5;
    animate((elapsed) => {
        circle3.attr('cx', curx * (1-elapsed * 2 * movespeed /dist) + newx * elapsed * 2 * movespeed /dist)
        circle3.attr('cy', cury * (1-elapsed * 2 * movespeed /dist) + newy * elapsed * 2 * movespeed /dist)
        circle3mask.attr('cx', circle3.attr('cx'));
        circle3mask.attr('cy', circle3.attr('cy'));
    },dist/(movespeed))
})

;