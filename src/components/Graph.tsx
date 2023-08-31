import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./styles/Graph.css";

interface HierarchyNode {
  name: string; // 节点名称
  version: string; // 版本号
  children: HierarchyNode[]; // 子节点
  hasCircularDependency?: boolean; // 标记循环依赖
  hasDuplicateDependency?: boolean; // 标记重复依赖
  totalDependencies: number; // 依赖总数
}

function convertHierarchy(data: any, ancestors: string[] = []): HierarchyNode {
  const root: HierarchyNode = {
    name: data.name,
    version: data.version,
    children: [],
    totalDependencies: 0,
  };

  let hasCircularDependency = false;
  let hasDuplicateDependency = false;

  if (data.dependecies && data.dependecies.length > 0) {
    const dependencyCountMap = new Map();
    data.dependecies.forEach((dep) => {
      if (dependencyCountMap.has(dep.name)) {
        dependencyCountMap.set(dep.name, dependencyCountMap.get(dep.name) + 1);
        hasDuplicateDependency = true;
      } else {
        dependencyCountMap.set(dep.name, 1);
      }

      if (ancestors.includes(dep.name)) {
        hasCircularDependency = true;
      }

      ancestors.push(dep.name);

      const childNode = convertHierarchy(dep, ancestors);
      root.children.push(childNode);

      if (childNode.children.length === 0) {
        root.totalDependencies += 1;
      } else {
        root.totalDependencies += childNode.totalDependencies;
      }

      ancestors.pop();
    });

    root.hasCircularDependency = hasCircularDependency;
    root.hasDuplicateDependency = hasDuplicateDependency;
  }

  return root;
}

function mergeHierarchyData(dataObjects): HierarchyNode {
  const mergedRoot: HierarchyNode = {
    name: "Project Name: ##########",
    version: "=====",
    children: [],
    totalDependencies: 0,
  };

  dataObjects.forEach((data) => {
    const hierarchyData = convertHierarchy(data);
    mergedRoot.children.push(hierarchyData);
    mergedRoot.totalDependencies += hierarchyData.totalDependencies;
  });
  return mergedRoot;
}

function drawNodelinks(divElement, data: HierarchyNode) {
  const localData = data;
  let localIndex = 0;
  let margin = { top: 20, left: 20, right: 20 },
    i = 0,
    nodeSize = 20,
    duration = 500,
    format = d3.format(",");

  let nodeEnterTransition = d3.transition().duration(750).ease(d3.easeLinear);

  const root = d3.hierarchy(data).eachBefore((d) => (d.index = i++));
  const nodeslength = root.descendants();

  let columns = [
    {
      label: "NPM Package Analyzer",
      value: null,
      format,
      x: 140,
      render: (text) => null,
    },
    {
      label: "Version",
      value: (d) => d.version,
      format,
      x: window.innerWidth - 400,
      render: (text) => text.data.version,
    },
    {
      label: "Dependencies",
      value: (d) => d.hasCircularDependency,
      format: (value, d) => (d.children ? format(value) : "-"),
      x: window.innerWidth - 300,
      render: (text) => text.data.totalDependencies,
    },
  ];

  d3.selectAll("svg").remove();
  const svg = d3
    .select(divElement)
    .append("svg")
    .attr("viewBox", [
      -nodeSize / 2,
      -(nodeSize * 3) / 2,
      window.innerWidth - 200,
      (nodeslength.length + 1) * nodeSize,
    ])
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .style("overflow", "visible");

  function update() {
    const nodes = root.descendants();

    const node = svg
      .selectAll(".node")
      .data(nodes, (d) => d.id || (d.id = ++i));

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#aac4ff")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr(
        "d",
        (d) => `
        M${d.source.depth * nodeSize},${d.source.index * nodeSize}
        V${d.target.index * nodeSize}
        h${nodeSize}
      `
      )
      .attr("class", (d) => `link${d.source.index}`);

    const nodeEnter = node.enter().append("g").attr("class", "node");

    nodeEnter
      .attr("transform", (d) => `translate(0,${d.index * nodeSize})`)
      .on("click", (event) => click(event.target.__data__));

    nodeEnter
      .append("circle")
      .attr("cx", (d) => d.depth * nodeSize)
      .attr("r", 3)
      .attr("fill", (d) => (d.children ? "#2863ed" : "#d2daff"))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    nodeEnter
      .append("rect")
      .attr("x", (d) => d.depth * nodeSize + 6)
      .attr("y", -nodeSize / 2 + 3)
      .attr("width", (d) => d.data.name.length * 7.5)
      .attr("height", 15)
      .attr("fill", "#d2daff")
      .attr("stroke", "black")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("opacity", (d) => (d.depth == 0 ? 0 : 0.3));

    nodeEnter
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => d.depth * nodeSize + 8)
      .text((d) => d.data.name)
      .attr("font-size", (d) => (d.depth == 0 ? "13px" : "12px"));

    nodeEnter.append("title").text((d) =>
      d
        .ancestors()
        .reverse()
        .map((d) => d.data.name)
        .join("/")
    );

    for (const { label, value, format, x, render } of columns) {
      svg
        .append("text")
        .attr("dy", "0.32em")
        .attr("y", -nodeSize)
        .attr("x", x)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .attr("font-size", "13px")
        .attr("fill", "#2863ed")
        .text(label);

      nodeEnter
        .append("text")
        .attr("dy", "0.32em")
        .attr("x", x)
        .attr("text-anchor", "end")
        .text((d) => render(d))
        .attr("font-size", "12px");
    }

    node.exit().transition().duration(duration).style("opacity", 0).remove();

    link.exit().transition().duration(duration).style("opacity", 0).remove();
  }

  function click(d) {
    const allPaths: number[] = [];
    allPaths.push(d.index);
    if (d.parent) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
        const allChildren = d.descendants();
        allChildren[0]["_children"].forEach(function (c) {
          allPaths.push(c.index);
          c.descendants().forEach((gc) => {
            allPaths.push(gc.index);
          });
        });
      } else {
        d.children = d._children;
        d._children = null;
      }
      allPaths.map((p) => d3.selectAll(`path.link${p}`).remove());
      d3.select(this).remove();

      update();
    }
  }

  update();
  return svg.node();
}

export default function Graph() {
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('http://localhost:3030')
        const response = await fetch("./result.json");
        const data = await response.json();

        const mergedHierarchyData = mergeHierarchyData([
          data[0],
          data[1],
          data[2],
          data[3],
          data[4],
        ]);

        const divElement = document.getElementById("graph-pane");

        drawNodelinks(divElement, mergedHierarchyData);
        setJsonData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    };
    fetchData();
  }, []);

  return <div id="graph-pane"></div>;
}
