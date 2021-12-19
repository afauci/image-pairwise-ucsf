const pairwise = require('../pairwise-comparison.js');

let nodeA = new pairwise.SortedNode(new pairwise.Item("nameA", 0));
let nodeB = new pairwise.SortedNode(new pairwise.Item("nameB", 0));
let nodeC = new pairwise.SortedNode(new pairwise.Item("nameC", 0));
let nodeD = new pairwise.SortedNode(new pairwise.Item("nameD", 0));
  
test('SortedNode initiation creates empty < and > groups', () => {
    expect(nodeA.isLessThan.size).toBe(0);
    expect(nodeA.isGreaterThan.size).toBe(0);
});

test('There are now items in less than and greater than for nodes A and B when sorted', () => {
    nodeA.addToSortedNode(nodeB, "left");
    expect(nodeA.isGreaterThan.has(nodeB)).toBe(true);
    expect(nodeB.isLessThan.has(nodeA)).toBe(true);
    expect(nodeA.isLessThan.size).toBe(0);
    expect(nodeB.isGreaterThan.size).toBe(0);
});

test('When we compare node A and C, since A < C, it adds B to < C since B < A', () => {
    nodeA.addToSortedNode(nodeC, "right");
    expect(nodeA.isLessThan.has(nodeC)).toBe(true);
    expect(nodeC.isGreaterThan.has(nodeA)).toBe(true);
    expect(nodeC.isGreaterThan.has(nodeB)).toBe(true);
});

test('And since B is already in the < C group, we do not have to compare', () => {
    expect(nodeC.isAlreadySorted(nodeB)).toBe(true);
    expect(nodeB.isLessThan.has(nodeC)).toBe(true);
})

test('If node D and node A area tie, we can all all of the < and > from node A to node D', () => {
    nodeA.addToSortedNode(nodeD, "tie");
    expect(nodeA.isTied.has(nodeD)).toBe(true);
    expect(nodeD.isTied.has(nodeA)).toBe(true);
    expect(nodeD.isAlreadySorted(nodeB)).toBe(true);
    expect(nodeD.isGreaterThan.has(nodeB)).toBe(true);
    expect(nodeD.isAlreadySorted(nodeC)).toBe(true);
    expect(nodeD.isLessThan.has(nodeC)).toBe(true);
})

test('Each node has the other nodes in their sorted sets', () => {
    expect(nodeA.isLessThan.size).toBe(1); // A < C
    expect(nodeA.isGreaterThan.size).toBe(1); //  > B
    expect(nodeA.isTied.size).toBe(1); // = D

    expect(nodeB.isLessThan.size).toBe(3); // B < ACD
    expect(nodeB.isGreaterThan.size).toBe(0); // B > none
    expect(nodeB.isTied.size).toBe(0); // B = none

    expect(nodeC.isLessThan.size).toBe(0); // C < none
    expect(nodeC.isGreaterThan.size).toBe(3); // C > ABD
    expect(nodeC.isTied.size).toBe(0); // C = none

    expect(nodeD.isLessThan.size).toBe(1); // D < C
    expect(nodeD.isGreaterThan.size).toBe(1); // D > B
    expect(nodeD.isTied.size).toBe(1); // D = A
})