const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const squareSide = 100;
let gameStatus = "o";

const canvas = d3.select("body")
                    .append("svg")
                    .attr("width", screenWidth)
                    .attr("height", screenHeight)
                    .style("position", "fixed");

