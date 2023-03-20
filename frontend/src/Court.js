import React, { Component } from 'react'
import * as d3 from "d3";
import "./Court.css"

export default class Court extends Component {
    componentDidMount() {
        drawCourt()
        drawBall()
        moveBall()
    }

    render() {
        return (
            <div>
                <div id="court" />
                <div id="ball" />
            </div>
        )
    }
}

// Based on https://gist.github.com/YouthBread/4481cdd85d60a503a986d658404232c8
const drawCourt = () => {
    const margin = {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    };
    const court = d3.select("#court").append('svg');
    court.attr('width', 480)
        .attr('height', 480 / 50 * 47)

    court.append('table')

    const court_g = court.append('g');
    const title = d3.select(document.getElementById('caption')).append('text');

    const Basket = court_g.append('circle');
    const Backboard = court_g.append('rect');
    const Outterbox = court_g.append('rect');
    const Innerbox = court_g.append('rect');
    const CornerThreeLeft = court_g.append('rect');
    const CornerThreeRight = court_g.append('rect');
    const OuterLine = court_g.append('rect');
    const RestrictedArea = court_g.append('path')
    const TopFreeThrow = court_g.append('path')
    const BottomFreeThrow = court_g.append('path')
    const ThreeLine = court_g.append('path')
    const CenterOuter = court_g.append('path')
    const CenterInner = court_g.append('path')

    const slider_axis = court.append('g')
        .attr('class', 'slider-axis');
    const slider_rect = court.append('g')
        .attr('class', 'slider-rect');

    const rect_entity = slider_rect.append('rect');

    const court_xScale = d3.scaleLinear()
        .domain([-25, 25]);
    const court_yScale = d3.scaleLinear()
        .domain([-4, 43]);
    const shot_xScale = d3.scaleLinear()
        .domain([-250, 250]);
    const shot_yScale = d3.scaleLinear()
        .domain([-45, 420]);

    const color = d3.scaleSequential(d3.interpolateOrRd)
        .domain([5e-6, 3e-2]); // Points per square pixel.

    const width = 480;
    const height = width / 50 * 47;
    court_g.attr("width", width)
        .attr("height", height)

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    court_xScale.range([margin.left, innerWidth])
        .nice();

    court_yScale.range([margin.top, innerHeight])
        .nice();

    Basket.attr('cx', court_xScale(0))
        .attr('cy', court_yScale(-0.75))
        .attr('r', court_yScale(0.75) - court_yScale(0))
        .style('fill', 'None')
        .style('stroke', 'black');

    Backboard.attr('x', court_xScale(-3))
        .attr('y', court_yScale(-1.5))
        .attr('width', court_xScale(3) - court_xScale(-3))
        .attr('height', 1)
        .style('fill', 'none')
        .style('stroke', 'black');


    Outterbox
        .attr('x', court_xScale(-8))
        .attr('y', court_yScale(-4))
        .attr('width', court_xScale(8) - court_xScale(-8))
        .attr('height', court_yScale(15) - court_yScale(-4))
        .style('fill', 'none')
        .style('stroke', 'black');


    Innerbox
        .attr('x', court_xScale(-6))
        .attr('y', court_yScale(-4))
        .attr('width', court_xScale(6) - court_xScale(-6))
        .attr('height', court_yScale(15) - court_yScale(-4))
        .style('fill', 'none')
        .style('stroke', 'black');


    CornerThreeLeft
        .attr('x', court_xScale(-22))
        .attr('y', court_yScale(-4))
        .attr('width', 1)
        .attr('height', court_yScale(10) - court_yScale(-4))
        .style('fill', 'none')
        .style('stroke', 'black');

    CornerThreeRight
        .attr('x', court_xScale(22))
        .attr('y', court_yScale(-4))
        .attr('width', 1)
        .attr('height', court_yScale(10) - court_yScale(-4))
        .style('fill', 'none')
        .style('stroke', 'black');

    OuterLine
        .attr('x', court_xScale(-25))
        .attr('y', court_yScale(-4))
        .attr('width', court_xScale(25) - court_xScale(-25))
        .attr('height', court_yScale(43) - court_yScale(-4))
        .style('fill', 'none')
        .style('stroke', 'black');

    appendArcPath(RestrictedArea, court_xScale(3) - court_xScale(0), (90) * (Math.PI / 180), (270) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(-0.75) + ")");


    appendArcPath(TopFreeThrow, court_xScale(6) - court_xScale(0), (90) * (Math.PI / 180), (270) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(15) + ")");


    appendArcPath(BottomFreeThrow, court_xScale(6) - court_xScale(0), (-90) * (Math.PI / 180), (90) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .style("stroke-dasharray", ("3, 3"))
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(15) + ")");


    const angle = Math.atan((10 - 0.75) / (22)) * 180 / Math.PI
    const dis = court_yScale(18);
    appendArcPath(ThreeLine, dis, (angle + 90) * (Math.PI / 180), (270 - angle) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .attr('class', 'shot-chart-court-3pt-line')
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(0) + ")");


    appendArcPath(CenterOuter, court_xScale(6) - court_xScale(0), (-90) * (Math.PI / 180), (90) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(43) + ")");

    appendArcPath(CenterInner, court_xScale(2) - court_xScale(0), (-90) * (Math.PI / 180), (90) * (Math.PI / 180))
        .attr('fill', 'none')
        .attr("stroke", "black")
        .attr("transform", "translate(" + court_xScale(0) + ", " + court_yScale(43) + ")");

    // Clone and mirror the court
    const court2 = court.clone(true)
    court2.attr('transform', 'translate(-500, 340) rotate(-180)')
}


function appendArcPath(base, radius, startAngle, endAngle) {
    const points = 30;

    const angle = d3.scaleLinear()
        .domain([0, points - 1])
        .range([startAngle, endAngle]);

    const line = d3.lineRadial()
        .radius(radius)
        .angle(function (d, i) {
            return angle(i);
        });

    return base.datum(d3.range(points))
        .attr("d", line);
}

const drawBall = () => {
    const ball = d3.select("#ball").append('svg')
        .attr("width", 480)
        .attr("height", 480);
    const ball_g = ball.append("g")
    ball_g.append("circle")
        .attr('cx', 20)
        .attr('cy', 20)
        .attr('r', 10)
        .attr("fill", "#FFA500")
    return ball_g
}

const moveBall = () => {
    const ball = d3.select("#ball").select('svg').select("g").select("circle")
    ball.transition()
        .duration(1000)
        .attr('cx', Math.random() * 480)
        .attr('cy', Math.random() * (480 / 50 * 47))
        .on('end', moveBall)
}
