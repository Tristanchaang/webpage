const svg = d3.select('#app').append('svg');
const hi = svg.append('polygon')
const hi2 = svg.append('polygon')
const hi3 = svg.append('polygon')

hi.attr('points', '100,100 150,100 150,200 250,200 250,350 200,350 200,250 150,250 150,350 100,350')
hi2.attr('points', '300,200 450,200 450,150 300,150')
hi3.attr('points', '200,200 450,200 450,150 300,150')

const circle = svg.append('circle');

svg.attr('width', window.innerWidth);
svg.attr('height', window.innerHeight);

circle.attr('r', 30);
circle.attr('fill', 'red');

svg.on('mousemove', (event) => {
    circle.attr('cx', event.x);
    circle.attr('cy', event.y);
});

svg.on('click', (event) => {
    console.log(event.x, event.y);
});