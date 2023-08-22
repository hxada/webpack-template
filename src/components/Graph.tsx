import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Graph.css";

interface HierarchyNode {
  name: string;
  version: number;
  children: HierarchyNode[];
  hasCircularDependency?: boolean;
  hasDuplicateDependency?: boolean;
}

function convertHierarchy(data: any, ancestors: string[] = []): HierarchyNode {
  const root: HierarchyNode = {
    name: data.name,
    version: data.version,
    children: [],
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

      ancestors.pop();
    });

    root.hasCircularDependency = hasCircularDependency;
    root.hasDuplicateDependency = hasDuplicateDependency;
  }

  return root;
}

function mergeHierarchyData(dataObjects): HierarchyNode {
  const mergedRoot: HierarchyNode = {
    name: "mergedRoot",
    version: 0,
    children: [],
  };
  dataObjects.forEach((data) => {
    const hierarchyData = convertHierarchy(data);
    mergedRoot.children.push(hierarchyData);
  });
  return mergedRoot;
}

function createSvg() {
  const svg = d3
    .select("#graph-svg")
    .attr("width", "100%")
    .attr("height", "100%");
  const width = svg.node().getBoundingClientRect().width;
  const height = svg.node().getBoundingClientRect().height;
  return { svg, width, height };
}

function drawNodelinks(svg, width, height, hierarchyData) {
  const nodelinkG = svg
    .append("g")
    .attr("class", "nodelinkG")
    .attr("transform", `translate(30,10)`);
  const treeLayout = d3.tree().size([height - 50, width / 1.2]);
  const root = d3.hierarchy(hierarchyData);
  const links = treeLayout(root).links();
  const nodes = treeLayout(root).descendants();

  const link = nodelinkG
    .selectAll("path")
    .data(links)
    .join("path")
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    )
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", 0.5);

  const nodeWidth = d3.max(nodes, (d) => d.data.name.length * 8);

  const node = nodelinkG
    .selectAll("rect")
    .data(nodes)
    .join("circle")
    .attr("cx", (d) => d.y)
    .attr("cy", (d) => d.x)
    .attr("r", 3)
    .attr("fill", (d) => (d.data.hasCircularDependency ? "red" : "#ccc"))
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5);

  const label = nodelinkG
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("dy", "0.31em")
    .attr("x", (d) => d.y + 4)
    .attr("y", (d) => d.x)
    .text((d) => d.data.name)
    .attr("font-size", 8)
    .attr("fill", "black")
    .attr("text-anchor", "start");
}

export default function Graph() {
  const svgRef = useRef(null);

  useEffect(() => {
    const { svg, width, height } = createSvg();

    const fetchData = async () => {
      try {
        const response = await fetch("./result.json");
        const data = await response.json();

        const mergedHierarchyData = mergeHierarchyData([
          data[0],
          data[1],
          data[2],
          data[3],
          data[4],
        ]);

        console.log(mergedHierarchyData);
        drawNodelinks(svg, width, height, mergedHierarchyData);

        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        return [];
      }
    };
    fetchData();
  }, []);

  return (
    <div id="graph-pane">
      <svg ref={svgRef} id="graph-svg"></svg>
    </div>
  );
}
