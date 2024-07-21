const svg = d3.select('#app').append('svg');



const hallo = svg.append('rect');
const hallo2 = svg.append('rect');
const hallo3 = svg.append('rect');
const hallo4 = svg.append('rect');
const hallo5 = svg.append('rect');

const circle = svg.append('circle');

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);

circle.attr('r', 30);
circle.attr('fill', 'red');

hallo.attr('x', 100);
hallo.attr('y', 100);
hallo.attr('height', 250);
hallo.attr('width', 50);

hallo2.attr('x', 200);
hallo2.attr('y', 200);
hallo2.attr('height', 150);
hallo2.attr('width', 50);

hallo3.attr('x', 150);
hallo3.attr('y', 200);
hallo3.attr('height', 50);
hallo3.attr('width', 50);

hallo4.attr('x', 300);
hallo4.attr('y', 200);
hallo4.attr('height', 150);
hallo4.attr('width', 50);

hallo5.attr('x', 300);
hallo5.attr('y', 100);
hallo5.attr('height', 50);
hallo5.attr('width', 50);

svg.on('mousemove', (event) => {
    circle.attr('cx', event.x);
    circle.attr('cy', event.y);
});

svg.on('click', (event) => {
    console.log(event.x, event.y);
});