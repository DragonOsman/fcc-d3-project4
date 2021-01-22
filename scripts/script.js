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
    .rangeRound([600, 860]);
const color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[9]);
const padding = 60;
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", `translate(${padding - 20}, ${padding - 20})`);
legend.selectAll("rect")
    .data(color.range().map(function (d) {
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
    .attr("height", "8")
    .attr("width", d => legendXScale(d[1]) - legendXScale(d[0]))
    .attr("x", d => legendXScale(d[0]))
    .style("fill", d => color(d[0]));
legend.append("text")
    .attr("x", legendXScale.range()[0])
    .attr("y", "-6")
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
Promise.all(files.map(url => d3.json(url, {
    method: "GET",
    mode: "cors"
})))
    .then((values) => {
    const [education, us] = values;
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", (d) => d.id)
        .attr("data-education", (d) => {
        const result = education.filter(obj => obj.fips === d.id);
        if (result[0]) {
            return result[0].bachelorsOrHigher;
        }
        // could not find a matching fips id in the data
        console.log("couldn't find data for: ", d.id);
        return 0;
    })
        .style("fill", (d) => {
        const result = education.filter(obj => obj.fips === d.id);
        if (result[0]) {
            return color(result[0].bachelorsOrHigher);
        }
        // could not find a matching fips id in the data
        return color(0);
    })
        .attr("d", geoPath)
        .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip.html(() => {
            const result = education.filter(obj => obj.fips === d.id);
            if (result[0]) {
                return (`${result[0]["area_name"]}, ${result[0]["state"]}: ${result[0].bachelorsOrHigher}%`);
            }
            // could not find a matching fips id in the data
            return 0;
        })
            .attr("data-education", () => {
            const result = education.filter(obj => obj.fips === d.id);
            if (result[0]) {
                return result[0].bachelorsOrHigher;
            }
            // could not find a matching fips id in the data
            return 0;
        })
            .style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`);
    })
        .on("mouseout", () => {
        tooltip.style("opacity", 0);
    });
    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "states")
        .attr("d", geoPath);
});
