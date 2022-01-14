class Item {

  constructor(value, score) {
    this.value = value;
    this.score = score || 0;
  }
}

class Pair {

  constructor(item1, item2) {
    this.item1 = item1;
    this.item2 = item2;
    this.voted = false;
  }

  _voteFor(item) {
    if (!this.voted) {
      item.score++;
      this.voted = true;
    }
  }

  voteForItem1() {
    this._voteFor(this.item1);
  }

  voteForItem2() {
    this._voteFor(this.item2);
  }

  voteForTie() {
    // do nothing, since neither gets a point
    this.voted = true;
  }
}

class Metadata {

  constructor(masterperson, attachmentid) {
    this.masterperson = masterperson;
    this.attachmentid = attachmentid;
  }
}

class Group {

  constructor(masterperson, files) {
    this.masterperson = masterperson;
    this.files = files;
  }
}

class SortedNode {

  constructor(item) {
    this.item = item;
    this.isLessThan = new Set();
    this.isTied = new Set();
    this.isGreaterThan = new Set();
  }

  isAlreadyLessThan = function(comparedNode) {
    if (this.isLessThan.has(comparedNode)) {
      comparedNode.isGreaterThan.add(this);
      return true;
    }
    return false;
  }

  isAlreadyGreaterThan = function(comparedNode) {
    if (this.isGreaterThan.has(comparedNode)) {
      comparedNode.isLessThan.add(this);
      return true;
    }
    return false;
  }

  isAlreadyTied = function(comparedNode) {
    if (this.isTied.has(comparedNode)) {
      comparedNode.isTied.add(this);
    }
  }

  isAlreadySorted = function(comparedNode) {
    return (this.isAlreadyTied(comparedNode) || this.isAlreadyLessThan(comparedNode) || this.isAlreadyGreaterThan(comparedNode));
  }

  addToSortedNode = function(comparedNode, choice) {
    // if the left (i.e. this node) is chosen, this > compared
    if (choice === "left") {
      // add this node to the < group for the compared node
      comparedNode.isLessThan.add(this);
      // since this > compared, then all the nodes > this are also > compared
      this.addAllToSet(comparedNode.isLessThan, this.isLessThan);
      // add the compared node to < this
      this.isGreaterThan.add(comparedNode);
    // if the right (i.e. the compared node) is chosen, compared > this
    } else if (choice === "right") {
      // add this node to the > group for the compared node
      comparedNode.isGreaterThan.add(this);
      // since this < compared, all nodes < this are also < compared
      this.addAllToSet(comparedNode.isGreaterThan, this.isGreaterThan);
      // add compared to > group of this
      this.isLessThan.add(comparedNode);
    } else { // if a tie is chosen, this === compared
      // add this to tie groups
      comparedNode.isTied.add(this);
      this.isTied.add(comparedNode);
      // that means anything > this is also > compared (and vice versa)
      this.addAllToSet(comparedNode.isGreaterThan, this.isGreaterThan);
      this.addAllToSet(this.isGreaterThan, comparedNode.isGreaterThan);
      // and anything < this is < compared (and vice versa)
      this.addAllToSet(comparedNode.isLessThan, this.isLessThan);
      this.addAllToSet(this.isLessThan, comparedNode.isLessThan);
    }
  }

  addAllToSet(set, otherSet) {
    otherSet.forEach(item => {
      set.add(item);
    });
  }
}

class SavedState {

  constructor(isLessThanMap, isTiedMap, isGreaterThanMap, votedPairs) {
    this.isLessThanMap = isLessThanMap;
    this.isTiedMap = isTiedMap;
    this.isGreaterThanMap = isGreaterThanMap;
    this.votedPairs = votedPairs;
  }
}

// Note: This line is needed to run the pairwise-comparison.spec.js tests, but it causes an error on the webpage when loading. Uncomment and use yarn test to run the test.
// module.exports = { SortedNode, Item };