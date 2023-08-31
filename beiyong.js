//绘制节点链接图
// function drawNodelinks(svg, g, innerWidth, innerHeight, hierarchyData) {
//   const nodelinkG = g.append('g').attr('class', 'nodelinkG')

//   const treeLayout = d3.tree().size([innerWidth, innerHeight * 10]) // 调整为 innerHeight 和 innerWidth

//   const root = d3.hierarchy(hierarchyData)
//   const links = treeLayout(root).links()
//   const nodes = treeLayout(root).descendants()

//   const textWidth = 40
//   const textHeight = 8

//   const rootDepth = root.height
//   const layerHeight = 100
//   const svgHeight = rootDepth * layerHeight + textHeight
//   svg.attr('height', svgHeight)

//   const link = nodelinkG
//     .selectAll('path')
//     .data(links)
//     .join('path')
//     .attr(
//       'd',
//       d3
//         .linkVertical() // Changed to vertical link
//         .x((d) => d.x) // Swapped x and y
//         .y(function (d) {
//           // console.log(d)
//           return d.depth * layerHeight
//         })
//     )
//     .attr('fill', 'none')
//     .attr('stroke', '#aac4ff')
//     .attr('stroke-width', 1)

//   const nodeWidth = d3.max(nodes, (d) => d.data.name.length * 8)

//   const node = nodelinkG
//     .selectAll('circle') // Using circles for nodes
//     .data(nodes)
//     .join('circle')
//     .attr('cx', (d) => d.x)
//     .attr('cy', (d) => d.depth * layerHeight)
//     .attr('r', 3)
//     .attr('fill', (d) => (d.data.hasCircularDependency ? 'red' : '#8758ff'))
//     .attr('stroke', 'black')
//     .attr('stroke-width', 1)
//     .attr('stroke-opacity', 0.5)

//   const nodeLabels = nodelinkG
//     .selectAll('.node-label')
//     .data(nodes)
//     .join('g') // 使用 'g' 元素来容纳矩形和文本
//     .attr('class', 'node-label')
//     .attr(
//       'transform',
//       (d) =>
//         `translate(${d.x + textHeight},${
//           d.depth * layerHeight + textWidth / 2
//         })`
//     )

//   nodeLabels
//     .append('rect') // 创建边框矩形
//     .attr('x', -textWidth / 2 + 4) // 居中矩形
//     .attr('y', -textHeight / 2) // 居中矩形
//     .attr('width', textWidth + 20)
//     .attr('height', textHeight)
//     .attr('rx', 5)
//     .attr('ry', 5)
//     .attr('stroke', 'black')
//     .attr('stroke-width', 0.5)
//     .attr('fill', '#d2daff')
//     .attr('transform', 'rotate(90)')

//   nodeLabels
//     .append('text') // 创建文本
//     .attr('x', -textWidth / 2 + 8) // 居中文本
//     .attr('y', 0) // 居中文本
//     .text((d) => {
//       const maxLength = textWidth / 5 // 假设每个字符宽度为 5
//       if (d.data.name.length > maxLength) {
//         return d.data.name.substr(0, maxLength) + '...' // 截断文本并添加省略号
//       }
//       return d.data.name
//     })
//     .attr('font-size', 8)
//     .attr('fill', 'black')
//     .attr('text-anchor', 'start')
//     .attr('dominant-baseline', 'middle')
//     .attr('transform', 'rotate(90)')
// }


import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './styles/Graph.css'

// 定义层次化数据结构类型
interface HierarchyNode {
    name: string // 节点名称
    version: number // 版本号
    children: HierarchyNode[] // 子节点
    hasCircularDependency?: boolean // 标记循环依赖
    hasDuplicateDependency?: boolean // 标记重复依赖
}

// 将扁平化数据转换为层次化数据
function convertHierarchy(data: any, ancestors: string[] = []): HierarchyNode {
    const root: HierarchyNode = {
        name: data.name,
        version: data.version,
        children: []
    }

    // 初始化循环依赖和重复依赖标记
    let hasCircularDependency = false
    let hasDuplicateDependency = false

    if (data.dependecies && data.dependecies.length > 0) {
        const dependencyCountMap = new Map() // 记录依赖项出现次数的 Map
        data.dependecies.forEach((dep) => {
            // 检查依赖项是否已经出现过
            if (dependencyCountMap.has(dep.name)) {
                dependencyCountMap.set(dep.name, dependencyCountMap.get(dep.name) + 1)
                hasDuplicateDependency = true
            } else {
                dependencyCountMap.set(dep.name, 1)
            }

            // 判断循环依赖
            if (ancestors.includes(dep.name)) {
                hasCircularDependency = true
            }

            ancestors.push(dep.name)

            const childNode = convertHierarchy(dep, ancestors)
            root.children.push(childNode)

            ancestors.pop()
        })

        // 设置循环依赖和重复依赖属性
        root.hasCircularDependency = hasCircularDependency
        root.hasDuplicateDependency = hasDuplicateDependency
    }

    return root
}

// 合并多个层次化数据对象为一个
function mergeHierarchyData(dataObjects): HierarchyNode {
    const mergedRoot: HierarchyNode = {
        name: 'mergedRoot',
        version: 0,
        children: []
    }
    dataObjects.forEach((data) => {
        const hierarchyData = convertHierarchy(data)
        mergedRoot.children.push(hierarchyData)
    })
    return mergedRoot
}

// // 创建 SVG 元素
// function createSvg() {
//   const margin = { left: 50, right: 50, top: 10 } // 左右的 margin 值
//   const svg = d3
//     .select('#graph-svg')
//     .attr('width', '100%')
//     .attr('height', '100%')

//   const innerWidth = svg.node().clientWidth - margin.left - margin.right // 计算内部宽度

//   const g = svg
//     .append('g')
//     .attr('transform', `translate(${margin.left},${margin.top})`) // 应用 margin

//   return { svg, innerWidth }
// }

function drawNodelinks(g, hierarchyData) {
    const format = d3.format(',')
    const nodeSize = 20
    const root = d3.hierarchy(hierarchyData).eachBefore(
        (
            (i) => (d) =>
                (d.index = i++)
        )(0)
    )
    // const root = d3.hierarchy(hierarchyData)
    console.log(root)
    const nodes = root.descendants()

    const columns = [
        {
            label: 'Size',
            value: (d) => d.value,
            format,
            x: 800
        },
        {
            label: 'Count',
            value: (d) => (d.children ? 0 : 1),
            format: (value, d) => (d.children ? format(value) : '-'),
            x: 820
        }
    ]

    const link = g
        .append('g')
        .attr('class', 'links')
        .selectAll()
        .data(root.links())
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr(
            'd',
            (d) => `
        M${d.source.depth * nodeSize},${d.source.index * nodeSize}
        V${d.target.index * nodeSize}
        h${nodeSize}
      `
        )

    const node = g
        .append('g')
        .attr('class', 'nodes')
        .selectAll()
        .data(nodes)
        .join('g')
        .attr('transform', (d) => `translate(0,${d.index * nodeSize})`)

    node
        .append('circle')
        .attr('cx', (d) => d.depth * nodeSize)
        .attr('r', 2.5)
        .attr('fill', (d) => (d.children ? null : '#999'))

    node
        .append('text')
        .attr('dy', '0.32em')
        .attr('x', (d) => d.depth * nodeSize + 6)
        .text((d) => d.data.name)

    node.append('title').text((d) =>
        d
            .ancestors()
            .reverse()
            .map((d) => d.data.name)
            .join('/')
    )

    for (const { label, value, format, x } of columns) {
        svg
            .append('text')
            .attr('dy', '0.32em')
            .attr('y', -nodeSize)
            .attr('x', x)
            .attr('text-anchor', 'end')
            .attr('font-weight', 'bold')
            .text(label)

        node
            .append('text')
            .attr('dy', '0.32em')
            .attr('x', x)
            .attr('text-anchor', 'end')
            .attr('fill', (d) => (d.children ? null : '#555'))
            .data(root.copy().sum(value).descendants())
            .text((d) => format(d.value, d))
    }

    return svg.node()
}


export default function Graph() {
    const svgRef = useRef(null)
    const gRef = useRef(null)
    const [jsonData, setJsonData] = useState([])

    useEffect(() => {
        const svgElement = d3
            .select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')

        const gElement = svgElement
            .append('g')
            .attr('transform', `translate(${20},${20})`)
        gRef.current = gElement

        const fetchData = async () => {
            try {
                // const response = await fetch('http://localhost:3030')
                const response = await fetch('./result.json')
                const data = await response.json()

                // 将多个数据对象合并为一个层次化数据对象
                const mergedHierarchyData = mergeHierarchyData([
                    data[0],
                    data[1],
                    data[2],
                    data[3],
                    data[4]
                ])

                drawNodelinks(gElement, mergedHierarchyData)

                setJsonData(data)

                return data
            } catch (error) {
                console.error('Error fetching data:', error)
                return []
            }
        }
        fetchData()
    }, [])

    return (
        <div id="graph-pane">
            <svg ref={svgRef} id="graph-svg"></svg>
        </div>
    )
}

// function drawNodelinks(g, hierarchyData) {
//   const format = d3.format(',')
//   const nodeSize = 20
//   const root = d3.hierarchy(hierarchyData).eachBefore(
//     (
//       (i) => (d) =>
//         (d.index = i++)
//     )(0)
//   )
//   const nodes = root.descendants()

//   const columns = [
//     {
//       label: 'NPM PACKAGE ANALYZER',
//       value: (d) => d.version,
//       format,
//       x: 150,
//       render: null
//     },
//     {
//       label: 'version',
//       value: (d) => d.version,
//       format,
//       x: 500,
//       render: (text) => text.data.version
//     },
//     {
//       label: 'dependencies',
//       value: (d) => d.hasCircularDependency,
//       format,
//       x: 600,
//       render: (text) => text.data.totalDependencies
//     }
//   ]

//   const link = g
//     .append('g')
//     .attr('class', 'links')
//     .selectAll()
//     .data(root.links())
//     .join('path')
//     .attr('fill', 'none')
//     .attr('stroke', '#8758ff')
//     .attr(
//       'd',
//       (d) => `
//         M${d.source.depth * nodeSize},${d.source.index * nodeSize}
//         V${d.target.index * nodeSize}
//         h${nodeSize}
//       `
//     )

//   const node = g
//     .append('g')
//     .attr('class', 'nodes')
//     .attr('cursor', 'pointer')
//     .attr('pointer-events', 'all')
//     .selectAll()
//     .data(nodes)
//     .join('g')
//     .attr('transform', (d) => `translate(0,${d.index * nodeSize})`)

//   node
//     .append('circle')
//     .attr('cx', (d) => d.depth * nodeSize)
//     .attr('r', 3)
//     .attr('fill', (d) => (d.children ? '#8758ff' : '#aac4ff'))

//   node
//     .append('rect')
//     .attr('x', (d) => d.depth * nodeSize + 6)
//     .attr('y', -nodeSize / 2 + 3)
//     .attr('width', (d) => d.data.name.length * 7.5)
//     .attr('height', 15)
//     .attr('fill', '#d2daff')
//     .attr('stroke', 'black')
//     .attr('rx', 5)
//     .attr('ry', 5)
//     .attr('opacity', (d) => (d.depth == 0 ? 0 : 0.3))

//   node
//     .append('text')
//     .attr('dy', '0.32em')
//     .attr('x', (d) => d.depth * nodeSize + 8)
//     .text((d) => d.data.name)
//     .attr('fill', '#555')
//     .attr('font-size', (d) => (d.depth == 0 ? '13px' : '12px'))
//     .attr('font-weight', (d) => (d.depth == 0 ? 'bold' : 'normal'))

//   node.append('title').text((d) =>
//     d
//       .ancestors()
//       .reverse()
//       .map((d) => d.data.name)
//       .join('/')
//   )

//   for (const { label, value, format, x, render } of columns) {
//     g.append('text')
//       .attr('dy', '0.32em')
//       .attr('y', -nodeSize)
//       .attr('x', x)
//       .attr('text-anchor', 'end')
//       .attr('font-weight', 'bold')
//       .attr('font-size', '12px')
//       .attr('fill', '#8758ff')
//       .text(label)

//     node
//       .append('text')
//       .attr('dy', '0.32em')
//       .attr('x', x)
//       .attr('text-anchor', 'end')
//       .attr('fill', '#555')
//       .data(root.copy().sum(value).descendants())
//       .attr('font-size', '12px')
//       .attr('font-weight', (d) => (d.depth == 0 ? 'bold' : 'normal'))
//       .text(render)
//   }

//   // let needRedraw = false // 添加一个变量来标记是否需要重新绘制

//   // function updateNodeInHierarchy(node, targetName, updatedNode) {
//   //   if (node.name === targetName) {
//   //     // 更新节点
//   //     node.children = updatedNode.children
//   //     node._children = updatedNode._children
//   //   } else {
//   //     // 递归查找子节点
//   //     if (node.children) {
//   //       for (const childNode of node.children) {
//   //         updateNodeInHierarchy(childNode, targetName, updatedNode)
//   //       }
//   //     }
//   //   }
//   // }

//   // function toggleChildren(event, d) {
//   //   g.selectAll('*').remove()

//   //   if (d.children) {
//   //     d._children = d.children
//   //     d.children = null
//   //   } else {
//   //     d.children = d._children
//   //     d._children = null
//   //   }

//   //   // 更新 hierarchyData 中的节点状态
//   //   updateNodeInHierarchy(hierarchyData, d.data.name, d)

//   //   needRedraw = true // 标记需要重新绘制
//   // }

//   // // 在需要的地方检查标记并重新绘制
//   // if (needRedraw) {
//   //   drawNodelinks(g, hierarchyData)
//   //   needRedraw = false // 重新绘制后重置标记
//   // }

//   return g.node()
// }


import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './styles/Graph.css'

interface HierarchyNode {
    name: string // 节点名称
    version: string // 版本号
    children: HierarchyNode[] // 子节点
    hasCircularDependency?: boolean // 标记循环依赖
    hasDuplicateDependency?: boolean // 标记重复依赖
    totalDependencies: number // 依赖总数
}

function convertHierarchy(data: any, ancestors: string[] = []): HierarchyNode {
    const root: HierarchyNode = {
        name: data.name,
        version: data.version,
        children: [],
        totalDependencies: 0
    }

    let hasCircularDependency = false
    let hasDuplicateDependency = false

    if (data.dependecies && data.dependecies.length > 0) {
        const dependencyCountMap = new Map()
        data.dependecies.forEach((dep) => {
            if (dependencyCountMap.has(dep.name)) {
                dependencyCountMap.set(dep.name, dependencyCountMap.get(dep.name) + 1)
                hasDuplicateDependency = true
            } else {
                dependencyCountMap.set(dep.name, 1)
            }

            if (ancestors.includes(dep.name)) {
                hasCircularDependency = true
            }

            ancestors.push(dep.name)

            const childNode = convertHierarchy(dep, ancestors)
            root.children.push(childNode)

            if (childNode.children.length === 0) {
                root.totalDependencies += 1
            } else {
                root.totalDependencies += childNode.totalDependencies
            }

            ancestors.pop()
        })

        root.hasCircularDependency = hasCircularDependency
        root.hasDuplicateDependency = hasDuplicateDependency
    }

    return root
}

function mergeHierarchyData(dataObjects): HierarchyNode {
    const mergedRoot: HierarchyNode = {
        name: 'Project Name: ##########',
        version: '=====',
        children: [],
        totalDependencies: 0
    }

    dataObjects.forEach((data) => {
        const hierarchyData = convertHierarchy(data)
        mergedRoot.children.push(hierarchyData)
        mergedRoot.totalDependencies += hierarchyData.totalDependencies
    })
    return mergedRoot
}

function drawNodelinks(divElement, data: HierarchyNode) {
    let margin = { top: 20, left: 20, right: 20 },
        i = 0,
        nodeSize = 20,
        duration = 500,
        format = d3.format(',')

    let nodeEnterTransition = d3.transition().duration(750).ease(d3.easeLinear)

    const root = d3.hierarchy(data).eachBefore((d) => (d.index = i++))
    const nodeslength = root.descendants()

    let columns = [
        {
            label: 'NPM Package Analyzer',
            value: null,
            format,
            x: 140,
            render: (text) => null
        },
        {
            label: 'Version',
            value: (d) => d.version,
            format,
            x: window.innerWidth - 400,
            render: (text) => text.data.version
        },
        {
            label: 'Dependencies',
            value: (d) => d.hasCircularDependency,
            format: (value, d) => (d.children ? format(value) : '-'),
            x: window.innerWidth - 300,
            render: (text) => text.data.totalDependencies
        }
    ]

    d3.selectAll('svg').remove()
    const svg = d3
        .select(divElement)
        .append('svg')
        .attr('viewBox', [
            -nodeSize / 2,
            -(nodeSize * 3) / 2,
            window.innerWidth,
            (nodeslength.length + 1) * nodeSize
        ])
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .style('overflow', 'visible')

    function update() {
        const nodes = root.descendants()

        const node = svg.selectAll('.node').data(nodes, (d) => d.id || (d.id = ++i))

        const link = svg
            .append('g')
            .attr('fill', 'none')
            .attr('stroke', '#aac4ff')
            .selectAll('path')
            .data(root.links())
            .join('path')
            .attr(
                'd',
                (d) => `
          M${d.source.depth * nodeSize},${d.source.index * nodeSize}
          V${d.target.index * nodeSize}
          h${nodeSize}
        `
            )
            .attr('class', (d) => `link${d.source.index}`)

        const nodeEnter = node.enter().append('g').attr('class', 'node')

        nodeEnter
            .attr('transform', (d) => `translate(0,${d.index * nodeSize})`)
            .on('click', (event) => click(event.target.__data__))

        nodeEnter
            .append('circle')
            .attr('cx', (d) => d.depth * nodeSize)
            .attr('r', 3)
            .attr('fill', (d) => (d.children ? '#8758ff' : '#aac4ff'))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)

        nodeEnter
            .append('rect')
            .attr('x', (d) => d.depth * nodeSize + 6)
            .attr('y', -nodeSize / 2 + 3)
            .attr('width', (d) => d.data.name.length * 7.5)
            .attr('height', 15)
            .attr('fill', '#d2daff')
            .attr('stroke', 'black')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('opacity', (d) => (d.depth == 0 ? 0 : 0.3))

        nodeEnter
            .append('text')
            .attr('dy', '0.32em')
            .attr('x', (d) => d.depth * nodeSize + 8)
            .text((d) => d.data.name)
            .attr('font-size', (d) => (d.depth == 0 ? '13px' : '12px'))

        nodeEnter.append('title').text((d) =>
            d
                .ancestors()
                .reverse()
                .map((d) => d.data.name)
                .join('/')
        )

        for (const { label, value, format, x, render } of columns) {
            svg
                .append('text')
                .attr('dy', '0.32em')
                .attr('y', -nodeSize)
                .attr('x', x)
                .attr('text-anchor', 'end')
                .attr('font-weight', 'bold')
                .attr('font-size', '13px')
                .attr('fill', '#8758ff')
                .text(label)

            nodeEnter
                .append('text')
                .attr('dy', '0.32em')
                .attr('x', x)
                .attr('text-anchor', 'end')
                .text((d) => render(d))
                .attr('font-size', '12px')
            // .attr('font-weight', (d) => (d.depth == 0 ? 'bold' : 'normal'))
        }

        node.exit().transition().duration(duration).style('opacity', 0).remove()

        link.exit().transition().duration(duration).style('opacity', 0).remove()
    }

    function click(d) {
        const allPaths = []
        allPaths.push(d.index)
        if (d.parent) {
            if (d.children) {
                d._children = d.children
                d.children = null
                const allChildren = d.descendants()
                allChildren[0]['_children'].forEach(function (c) {
                    allPaths.push(c.index)
                    c.descendants().forEach((gc) => {
                        allPaths.push(gc.index)
                    })
                })
            } else {
                d.children = d._children
                d._children = null
            }
            allPaths.map((p) => d3.selectAll(`path.link${p}`).remove())
            // d3.select(this).remove()
            update()
        }
    }

    update()
    return svg.node()
}

export default function Graph() {
    const [jsonData, setJsonData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3030')
                // const response = await fetch('./result.json')
                const data = await response.json()

                const mergedHierarchyData = mergeHierarchyData([
                    data[0],
                    data[1],
                    data[2],
                    data[3],
                    data[4]
                ])

                const divElement = document.getElementById('graph-pane')

                drawNodelinks(divElement, mergedHierarchyData)
                setJsonData(data)
            } catch (error) {
                console.error('Error fetching data:', error)
                return []
            }
        }
        fetchData()
    }, [])

    return <div id="graph-pane"></div>
}



import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './styles/Graph.css'

interface HierarchyNode {
    name: string // 节点名称
    version: string // 版本号
    children: HierarchyNode[] // 子节点
    hasCircularDependency?: boolean // 标记循环依赖
    hasDuplicateDependency?: boolean // 标记重复依赖
    totalDependencies: number // 依赖总数
}

function convertHierarchy(data: any, ancestors: string[] = []): HierarchyNode {
    const root: HierarchyNode = {
        name: data.name,
        version: data.version,
        children: [],
        totalDependencies: 0
    }

    let hasCircularDependency = false
    let hasDuplicateDependency = false

    if (data.dependecies && data.dependecies.length > 0) {
        const dependencyCountMap = new Map()
        data.dependecies.forEach((dep) => {
            if (dependencyCountMap.has(dep.name)) {
                dependencyCountMap.set(dep.name, dependencyCountMap.get(dep.name) + 1)
                hasDuplicateDependency = true
            } else {
                dependencyCountMap.set(dep.name, 1)
            }

            if (ancestors.includes(dep.name)) {
                hasCircularDependency = true
            }

            ancestors.push(dep.name)

            const childNode = convertHierarchy(dep, ancestors)
            root.children.push(childNode)

            if (childNode.children.length === 0) {
                root.totalDependencies += 1
            } else {
                root.totalDependencies += childNode.totalDependencies
            }

            ancestors.pop()
        })

        root.hasCircularDependency = hasCircularDependency
        root.hasDuplicateDependency = hasDuplicateDependency
    }

    return root
}

function mergeHierarchyData(dataObjects): HierarchyNode {
    const mergedRoot: HierarchyNode = {
        name: 'Project Name: ##########',
        version: '=====',
        children: [],
        totalDependencies: 0
    }

    dataObjects.forEach((data) => {
        const hierarchyData = convertHierarchy(data)
        mergedRoot.children.push(hierarchyData)
        mergedRoot.totalDependencies += hierarchyData.totalDependencies
    })
    return mergedRoot
}

function drawNodelinks(divElement, data: HierarchyNode) {
    const localData = data
    let localIndex = 0
    let margin = { top: 20, left: 20, right: 20 },
        i = 0,
        nodeSize = 20,
        duration = 500,
        format = d3.format(',')

    let nodeEnterTransition = d3.transition().duration(750).ease(d3.easeLinear)

    const root = d3.hierarchy(data).eachBefore((d) => (d.index = i++))
    const nodeslength = root.descendants()

    let columns = [
        {
            label: 'NPM Package Analyzer',
            value: null,
            format,
            x: 140,
            render: (text) => null
        },
        {
            label: 'Version',
            value: (d) => d.version,
            format,
            x: window.innerWidth - 400,
            render: (text) => text.data.version
        },
        {
            label: 'Dependencies',
            value: (d) => d.hasCircularDependency,
            format: (value, d) => (d.children ? format(value) : '-'),
            x: window.innerWidth - 300,
            render: (text) => text.data.totalDependencies
        }
    ]

    d3.selectAll('svg').remove()
    const svg = d3
        .select(divElement)
        .append('svg')
        .attr('viewBox', [
            -nodeSize / 2,
            -(nodeSize * 3) / 2,
            window.innerWidth - 200,
            (nodeslength.length + 1) * nodeSize
        ])
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .style('overflow', 'visible')

    function update(source = root) {
        const nodes = root.descendants()

        const node = svg.selectAll('.node').data(nodes, (d) => d.id || (d.id = ++i))

        const link = svg
            .append('g')
            .attr('fill', 'none')
            .attr('stroke', '#aac4ff')
            .selectAll('path')
            .data(root.links())
            .join('path')
            .attr(
                'd',
                (d) => `
          M${d.source.depth * nodeSize},${d.source.index * nodeSize}
          V${d.target.index * nodeSize}
          h${nodeSize}
        `
            )
            .attr('class', (d) => `link${d.source.index}`)

        const nodeEnter = node.enter().append('g').attr('class', 'node')

        nodeEnter
            .attr('transform', (d) => `translate(0,${d.index * nodeSize})`)
            .on('click', (event) => click(event.target.__data__))

        nodeEnter
            .append('circle')
            .attr('cx', (d) => d.depth * nodeSize)
            .attr('r', 3)
            .attr('fill', (d) => (d.children ? '#2863ed' : '#d2daff'))
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.5)

        nodeEnter
            .append('rect')
            .attr('x', (d) => d.depth * nodeSize + 6)
            .attr('y', -nodeSize / 2 + 3)
            .attr('width', (d) => d.data.name.length * 7.5)
            .attr('height', 15)
            .attr('fill', '#d2daff')
            .attr('stroke', 'black')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('opacity', (d) => (d.depth == 0 ? 0 : 0.3))

        nodeEnter
            .append('text')
            .attr('dy', '0.32em')
            .attr('x', (d) => d.depth * nodeSize + 8)
            .text((d) => d.data.name)
            .attr('font-size', (d) => (d.depth == 0 ? '13px' : '12px'))

        nodeEnter.append('title').text((d) =>
            d
                .ancestors()
                .reverse()
                .map((d) => d.data.name)
                .join('/')
        )

        for (const { label, value, format, x, render } of columns) {
            svg
                .append('text')
                .attr('dy', '0.32em')
                .attr('y', -nodeSize)
                .attr('x', x)
                .attr('text-anchor', 'end')
                .attr('font-weight', 'bold')
                .attr('font-size', '13px')
                .attr('fill', '#2863ed')
                .text(label)

            nodeEnter
                .append('text')
                .attr('dy', '0.32em')
                .attr('x', x)
                .attr('text-anchor', 'end')
                .text((d) => render(d))
                .attr('font-size', '12px')
        }

        node.exit().transition().duration(duration).style('opacity', 0).remove()

        link.exit().transition().duration(duration).style('opacity', 0).remove()
    }

    function click(d) {
        // const allPaths: number[] = []
        // allPaths.push(d.index)
        // if (d.parent) {
        if (d.children) {
            d._children = d.children
            d.children = null
            // const allChildren = d.descendants()
            // allChildren[0]['_children'].forEach(function (c) {
            //   allPaths.push(c.index)
            //   c.descendants().forEach((gc) => {
            //     allPaths.push(gc.index)
            //   })
            // })
        } else {
            d.children = d._children
            d._children = null
            // }
            // allPaths.map((p) => d3.selectAll(`path.link${p}`).remove())
            // d3.select(this).remove()
            const root = d3
                .hierarchy(localData)
                .eachBefore((node) => (node.index = localIndex++))
            console.log(root)
            update(root)
            // update()
        }
    }

    update(root)
    return svg.node()
}

export default function Graph() {
    const [jsonData, setJsonData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await fetch('http://localhost:3030')
                const response = await fetch('./result.json')
                const data = await response.json()

                const mergedHierarchyData = mergeHierarchyData([
                    data[0],
                    data[1],
                    data[2],
                    data[3],
                    data[4]
                ])

                const divElement = document.getElementById('graph-pane')

                drawNodelinks(divElement, mergedHierarchyData)
                setJsonData(data)
            } catch (error) {
                console.error('Error fetching data:', error)
                return []
            }
        }
        fetchData()
    }, [])

    return <div id="graph-pane"></div>
}
