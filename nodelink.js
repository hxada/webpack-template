// Description: This file is used to create the node link diagram

const margin = { top: 20, right: 20, bottom: 60, left: 20 };
const width = 1200-margin.left-margin.right;
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

        const treeLayout=d3.tree().size([height-50,width-150]);
        const root=d3.hierarchy(hierarchyData);
        const links=treeLayout(root).links();
        const nodes=treeLayout(root).descendants();

        console.log(root);
        console.log(nodes);
        console.log(links);
        
        const nodeLink_svg = d3.select("#nodelink")
        .append("svg")
                .attr("width", width) // 交换width和height
                .attr("height", height)
                .style("border", "dotted")
        .append("g")
                .attr("transform", `translate(${margin.top},${margin.left})`); // 交换margin.left和margin.top

        // 修改连接路径生成器为linkHorizontal
        const link_g = nodeLink_svg.append("g")
                .attr("id", "links")
        const link = link_g.selectAll("path")
                .data(links)
                .join("path")
                .attr("d", d3.linkHorizontal() // 使用linkHorizontal
                        .x(d => d.y) // 交换x和y坐标
                        .y(d => d.x))
                .attr("fill", "none")
                .attr("stroke", "grey")
                .attr("stroke-width", 0.5)

        const node_g = nodeLink_svg.append("g")
                .attr("id", "nodes")
        const node = node_g.selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("cx", d => d.y) // 交换cx和cy坐标
                .attr("cy", d => d.x)
                .attr("r", 3)
                .attr("fill", "steelblue")
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
                // .attr("text-anchor", d => d.children ? "start" : "start")
                .attr("y", d => d.x)
                .text(d => d.data.name)
                .attr("font-size", 8)
                .attr("fill", "black")
                // .attr("text-anchor", "start") // 水平居中对齐
        // const maxLabelWidth = d3.max(nodes,d=>d.data.name.length*8); // 获取最大标签宽度
        // nodeLink_svg.attr("width",height+maxLabelWidth+margin.left+margin.right); // 设置svg宽度
    


        

        // const nodeLink_svg=d3.select("#nodelink")
        // .append("svg")
        //         .attr("width",width)
        //         .attr("height",height)
        //         .style("border","dotted")
        // .append("g")
        //         .attr("transform", `translate(${margin.left},${margin.top})`);

        // function drawDot(outter){
        // const pkgName_g=nodeLink_svg.append("g")
        //         .attr("id","pkgName")

        // const pkgName=pkgName_g.append("text")
        //         .attr("id","pkgName_text")
        //         .attr("x",0)
        //         .attr("y",outter*100+20)
        //         .text(data[outter].name)
        //         .attr("font-size",10)
        //         .attr("fill","black")
                        
        // const pkgDependecies_g=pkgName_g.append("g")
        //         .attr("id","pkgDependecies")
        // const pkgDependecies=pkgDependecies_g.selectAll("circle")
        //         .append("g")
        //         .attr("id","pkgDependecies")
        //         .data(data[outter].dependecies)
        //         .join("circle")
        //                 .attr("cx",(d,i)=>i*15+5)
        //                 .attr("cy",(d,i)=>outter*100+30)
        //                 .attr("r",5)
        //                 .attr("fill","steelblue")
        //                 .attr("stroke","black")
        // }

        // for(let i=0;i<data.length;i++){
        // let outter=i;
        // drawDot(outter);

        // }

})
