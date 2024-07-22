const svg = d3.select('#app').append('svg');
const hallo4 = svg.append('rect');
const hi = svg.append('polygon')

hi.attr('points', '100,100 150,100 150,200 250,200 250,350 200,350 200,250 150,250 150,350 100,350')

const circle = svg.append('circle');

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);

circle.attr('r', 30);
circle.attr('fill', 'red');

hallo4.attr('x', 300);
hallo4.attr('y', 200);
hallo4.attr('height', 150);
hallo4.attr('width', 50);


svg.on('mousemove', (event) => {
    circle.attr('cx', event.x);
    circle.attr('cy', event.y);
});

svg.on('click', (event) => {
    console.log(event.x, event.y);
});