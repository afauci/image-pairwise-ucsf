const app = new Vue({
  el: '#app',
  data: {
    nodes: [],
    pairs: [],
    metadata: new Map(),
    groups: new Map(),
    grader: null,
    masterpersonToNode: new Map(),
    // saved state that can uploaded if progress was saved from previous grading sessions
    savedState: null
  },
  methods: {
    addToGroup: function (file) {
      let masterpersonForItem = this.metadata.get(file.filename);
      let group = this.groups.get(masterpersonForItem);
      // if there's not already a group for the masterperson, create one
      if (group == null) {
        group = []
      }
      group.push(file);
      this.groups.set(masterpersonForItem, group);
    },
    addItem: function (group) {
      // each item's "value" is a group of photos from a single masterperson
      const newItem = new Item(new Group(group[0], group[1]));
      // each node has one item, and sets for <, =, and >
      const newSortedNode = new SortedNode(newItem);
      // each node is put into a pair with each other node
      for (const node of this.nodes) {
        this.pairs.push(new Pair(node, newSortedNode));
      }
      this.nodes.push(newSortedNode);
      this.masterpersonToNode.set(group[0], newSortedNode);
    },
    // creates the CSV content to be downloaded after ranking is complete
    csvGradedData: function() {
      csvItems = "grader,masterperson,rank,score\r\n";
      rank = 1;
      this.sortedNodes.forEach(node => {
        let fields = [this.grader, node.item.value.masterperson, rank, node.isGreaterThan.size];
        csvItems = csvItems.concat(fields.join(","), "\r\n");
        rank++;
      });
      return encodeURIComponent(csvItems);
    },
    // creates the CSV content for the saved state file that can be downloaded if state is saved partway through
    csvSavedData: function() {
      csvItems = "";
      this.nodes.forEach(node => {
        csvItems = csvItems.concat(node.item.value.masterperson + "," + this.csvForSet(node.isLessThan));
        csvItems = csvItems.slice(0,-1).concat("\r\n");
      });
      csvItems = csvItems.concat("|\r\n");
      this.nodes.forEach(node => {
        csvItems = csvItems.concat(node.item.value.masterperson + "," + this.csvForSet(node.isTied));
        csvItems = csvItems.slice(0,-1).concat("\r\n");
      });
      csvItems = csvItems.concat("|\r\n");
      this.nodes.forEach(node => {
        csvItems = csvItems.concat(node.item.value.masterperson + "," + this.csvForSet(node.isGreaterThan));
        csvItems = csvItems.slice(0,-1).concat("\r\n");
      });
      csvItems = csvItems.concat("|\r\n");
      this.votedPairs.forEach(pair => {
        let fields = [pair.item1.item.value.masterperson,pair.item2.item.value.masterperson];
        csvItems = csvItems.concat(fields.join(","), "\r\n");
      });
      return encodeURIComponent(csvItems);
    },
    csvForSet: function(set) {
      csvItemsForSet = "";
      set.forEach(node => {
        csvItemsForSet = csvItemsForSet.concat(node.item.value.masterperson + ",");
      })
      return csvItemsForSet;
    },
    startOver: function() {
      localStorage.clear();
      app.savedState = null;
      window.location.reload();
    }
  },
  computed: {
    // used to sort the groups for ranking after all comparisons
    sortedNodes: function () {
      return Array.from(this.nodes).sort((a, b) => b.isGreaterThan.size - a.isGreaterThan.size);
    },
    notVotedPairs: function () {
      return this.pairs.filter(pair => !pair.voted);
    },
    votedPairs: function () {
      return this.pairs.filter(pair => pair.voted);
    },
    nextNotVotedPair: function () {
      if (this.notVotedPairs.length > 0) {
        let nextPair = this.notVotedPairs[0];
        // check if we can already determine the sorting of the pair based on previous comparisons
        if (!(nextPair.item1.isAlreadySorted(nextPair.item2) || nextPair.item2.isAlreadySorted(nextPair.item1))) {
          return nextPair;
        } else {
          nextPair.voted = true;
          return this.nextNotVotedPair;
        }
      }
      return null;
    },
    allPairsVoted: function () {
      return this.pairs.length > 0 && this.notVotedPairs.length == 0;
    }
  },
  mounted() {
    if (localStorage.grader) {
      this.grader = localStorage.grader;
    }
  },
  watch: {
    grader(newGrader) {
      localStorage.grader = newGrader;
    }
  }
});

chooseLeft = function() {
  doSorting("left");
}

chooseRight = function() {
  doSorting("right");
}

chooseTie = function() {
  doSorting("tie");
}

doSorting = function(choice) {
  let pair = app.nextNotVotedPair;
  pair.voted = true;
  pair.item1.addToSortedNode(pair.item2, choice);
}

const filechooser = document.querySelector('#filechooser');
let images = [];

// upload images for sorting
filechooser.onchange = function () {
  images.forEach(URL.revokeObjectURL);

  images = Array.from(filechooser.files)
    .filter(file => /image\/.*/.test(file.type))
    .map(file => {
      return {
        filename: file.name,
        url: URL.createObjectURL(file)
      };
    });

  app.pairs = [];
  app.nodes = [];
  app.groups = new Map();
  for (const image of images) {
    app.addToGroup(image);
  }
  for (const group of app.groups.entries()) {
    app.addItem(group);
  }
  if (app.savedState != null) {
    processSavedState();
  }
}

// if the user uploads saved state, update the nodes to include the previous rankings
processSavedState = function() {
  app.nodes.forEach(node => {
    node.isLessThan = addAllFromSavedMap(node, app.savedState.isLessThanMap);
    node.isTied = addAllFromSavedMap(node, app.savedState.isTiedMap);
    node.isGreaterThan = addAllFromSavedMap(node, app.savedState.isGreaterThanMap);
  })
  
  app.pairs.forEach(pair => {
    let found = app.savedState.votedPairs.find(votedPair => {
      return (votedPair[0] === pair.item1.item.value.masterperson && votedPair[1] === pair.item2.item.value.masterperson) ||
      (votedPair[0] === pair.item2.item.value.masterperson && votedPair[1] === pair.item1.item.value.masterperson);
    })
    if (found != null) {
      pair.voted = true;
    }
  })
}

addAllFromSavedMap = function(node, savedMap) {
  // add saved state for each node
  let listOfMasterpersonsInSet = savedMap.get(node.item.value.masterperson);
  let setOfNodes = new Set();
  listOfMasterpersonsInSet.forEach(masterperson => {
    let node = app.masterpersonToNode.get(masterperson);
    setOfNodes.add(node);
  })
  return setOfNodes;
}

const metadatachooser = document.getElementById('metadatachooser');

// upload metadata CSV file
metadatachooser.onchange = function() {
  let metadataFile = metadatachooser.files[0];
  var reader = new FileReader();
  reader.onload = function(e){    
    let lines = this.result.split(/\r\n|\n/);
    // look for the masterperson and attachmentid column indices
    let fieldNames = lines.shift().split(',');
    app.metadata = new Map();
    // split lines and extract the masterperson and attachmentid fields
    lines.forEach(line => {
        let fields = line.split(',');
        app.metadata.set(fields[3], fields[0]);
      });
  };
  reader.readAsText(metadataFile);
}

// download CSV file with sorting results
downloadRankingCSV = function() {
  // clear data from previous comparisons
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + app.csvGradedData());
  element.setAttribute('download', "ranking.csv");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// downloads a CSV to save the current progress for ranking to be used in future sessions
saveCurrentProgress = function() {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + app.csvSavedData());
  element.setAttribute('download', "saved-grading-progress.csv");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


const savedProgressChooser = document.getElementById('savedProgressChooser');

// upload savedProgress from a CSV file
savedProgressChooser.onchange = function() {
  let savedProgressFile = savedProgressChooser.files[0];
  var reader = new FileReader();
  reader.onload = function(e){    
    let sections = this.result.split("|\r\n");

    // parse the less than mappings
    let nodeIsLessThanLines = sections[0].split("\r\n");
    let isLessThanMap = new Map();
    nodeIsLessThanLines.forEach(nodeLine => {
      let isLessThanValues = nodeLine.split(',');
      let baseNodeMasterperson = isLessThanValues.shift();
      isLessThanMap.set(baseNodeMasterperson, isLessThanValues);
    })

    // parse the tie mapping
    let nodeIsTiedLines = sections[1].split("\r\n");
    let isTiedMap = new Map();
    nodeIsTiedLines.forEach(nodeLine => {
      let isTiedValues = nodeLine.split(',');
      let baseNodeMasterperson = isTiedValues.shift();
      isTiedMap.set(baseNodeMasterperson, isTiedValues);
    })

    // parse the greater than mapping
    let nodeIsGreaterThanLines = sections[2].split("\r\n");
    let isGreaterThanMap = new Map();
    nodeIsLessThanLines.forEach(nodeLine => {
      let isLessThanValues = nodeLine.split(',');
      let baseNodeMasterperson = isLessThanValues.shift();
      isGreaterThanMap.set(baseNodeMasterperson, isLessThanValues);
    })

    let pairLines = sections[3].split("\r\n");
    let votedPairs = [];
    pairLines.forEach(pairLine => {
      let pairValues = pairLine.split(',');
      votedPairs.push(pairValues);
    })
    votedPairs.pop();

    app.savedState = new SavedState(isLessThanMap, isTiedMap, isGreaterThanMap, votedPairs);
  };
  reader.readAsText(savedProgressFile);
}

// Adapted from https://www.w3schools.com/howto/howto_css_modal_images.asp
zoomImage = function(clickedImg) {
  // Get the modal
  var modal = document.getElementById("image-zoom");

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var modalImg = document.getElementById("zoomed-img");
  modal.style.display = 'block';
  modalImg.src = clickedImg.src;

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = 'none';
  }

  document.onkeydown = function(event) {
    if (event.key === 'Backspace' || event.key === 'Enter' || event.key === 'Escape') {
      modal.style.display = 'none';
    }
  }
}
