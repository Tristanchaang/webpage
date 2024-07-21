const svg = d3.select('#app').append('svg');

const circle = svg.append('circle');

svg.attr('width', window.innerWidth)
svg.attr('height', window.innerHeight)

circle.attr('cx', 50)
circle.attr('cy', 50)

circle.attr('r', 30);

svg.on('mousemove', (event) => {
    console.log(event)
    circle.attr('cx', event.x);
    circle.attr('cy', event.y);
});