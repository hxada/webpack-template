// Description: This file is used to create the node link diagram

const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 800-margin.left-margin.right;
      height = 800-margin.top-margin.bottom;


d3.json("./result.json").then(function (data){
        console.log(data);

        function converttoHierarchy(data){
                const root={name:data.name,version:data.version,children:[]};
                if(data.dependecies&&data.dependecies.length>0){
                        data.dependecies.forEach(dep=>{
                                const childNode=converttoHierarchy(dep);
                                root.children.push(childNode);
                        });
                }
                return root;
        }
        const hierarchyData={name:"root",version:0,children:[]};
        hierarchyData.children.push(converttoHierarchy(data[0]));
        hierarchyData.children.push(converttoHierarchy(data[1]));
        hierarchyData.children.push(converttoHierarchy(data[2]));
        hierarchyData.children.push(converttoHierarchy(data[3]));
        hierarchyData.children.push(converttoHierarchy(data[4]));
        // hierarchyData.children.push(converttoHierarchy(data[5]));
        hierarchyData.children.push(converttoHierarchy(data[6]));

        console.log(hierarchyData);

        const treeLayout=d3.tree().size([height-50,width-100]);
        const root=d3.hierarchy(hierarchyData);
        const links=treeLayout(root).links();
        const nodes=treeLayout(root).descendants();
        console.log(links);
        console.log(nodes);

        const nodeLink_svg = d3.select("#nodelink")
        .append("svg")
                .attr("width", width) 
                .attr("height", height)
                .style("border", "dotted")
        .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`); 

        const link_g = nodeLink_svg.append("g")
                .attr("id", "links")
        const link = link_g.selectAll("path")
                .data(links)
                .join("path")
                .attr("d", d3.linkHorizontal()
                        .x(d => d.y)
                        .y(d => d.x)
                )
                .attr("fill", "none")
                .attr("stroke", "grey")
                .attr("stroke-width", 0.5)

        const nodeWidth=d3.max(nodes,d=>d.data.name.length*8);

        const node_g = nodeLink_svg.append("g")
                .attr("id", "nodes")
        // const node = node_g.selectAll("circle")
        //         .data(nodes)
        //         .join("circle")
        //         .attr("cx", d => d.y) 
        //         .attr("cy", d => d.x)
        //         .attr("r", 3)
        //         .attr("fill", "steelblue")
        //         .attr("stroke", "black")
        //         .attr("stroke-width", 1)
        //         .attr("stroke-opacity", 0.5)

        const node=node_g.selectAll("rect")
                .data(nodes)
                .join("rect")
                .attr("x", d => d.y)
                .attr("y", d => d.x-5)
                .attr("width", d=>d.data.name.length*5)
                .attr("height", 10)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.5)

        const label_g = nodeLink_svg.append("g")
                .attr("id", "labels")
        const label=label_g.selectAll("text")
                .data(nodes)
                .join("text")
                .attr("dy", "0.31em")
                .attr("x", d => d.y+4)
                .attr("y", d => d.x)
                .text(d => d.data.name)
                .attr("font-size", 8)
                .attr("fill", "black")
                .attr("text-anchor", "start")
        

})
