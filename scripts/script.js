"use strict";
const svg = d3.select("svg");
const tooltip = d3.select("main")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);
const geoPath = d3.geoPath();
const legendXScale = d3.scaleLinear()
    .domain([2.6, 75.1])
    .range([600, 860]);
const color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);
const padding = 60;
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", `translate(${padding}, ${padding} + 40)`);
legend.append("g")
    .data(color.range().map((d) => {
    d = color.invertExtent(d);
    if (d[0] === null) {
        d[0] = legendXScale.domain()[0];
    }
    if (d[1] === null) {
        d[1] = legendXScale.domain()[1];
    }
    return d;
}))
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("width", d => legendXScale(d[1]) - legendXScale(d[0]))
    .attr("x", d => legendXScale(d[0]))
    .style("fill", d => color(d[0]));
legend.append("text")
    .attr("x", legendXScale.range()[0])
    .attr("y", -6)
    .style("fill", "#fff")
    .attr("text-anchor", "start")
    .style("font-weight", "bold");
legend.call(d3.axisBottom(legendXScale)
    .tickSize(13)
    .tickFormat((x) => `${Math.round(x)}%`)
    .tickValues(color.domain()))
    .select(".domain")
    .remove();
const educationFile = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const countyFile = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
const files = [educationFile, countyFile];
