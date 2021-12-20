const app = new Vue({
  el: '#app',
  data: {
    nodes: [],
    pairs: [],
    sortingSets: new Map(),
    metadata: new Map(),
    groups: new Map(),
    grader: null
  },
  methods: {
    addToGroup: function (file) {
      let masterpersonForItem = this.metadata.get(file.filename);
      let group = this.groups.get(masterpersonForItem);
      if (group == null) {
        group = []
      }
      group.push(file);
      this.groups.set(masterpersonForItem, group);
    },
    addItem: function (group) {
      const newItem = new Item(new Group(group[0], group[1]));
      const newSortedNode = new SortedNode(newItem);
      for (const node of this.nodes) {
        this.pairs.push(new Pair(node, newSortedNode));
      }
      this.nodes.push(newSortedNode);
    },
    csvContent: function() {
      csvItems = "grader,masterperson,rank,score\n";
      rank = 1;
      this.sortedNodes.forEach(node => {
        var fields = [this.grader, node.item.value.masterperson, rank, node.item.score]
        csvItems = csvItems.concat(fields.join(","), "\r\n");
        rank++;
      });
      return encodeURIComponent(csvItems);
    }
  },
  computed: {
    sortedNodes: function () {
      return Array.from(this.nodes).sort((a, b) => b.isGreaterThan.size - a.isGreaterThan.size);
    },
    notVotedPairs: function () {
      return this.pairs.filter(pair => !pair.voted);
    },
    nextNotVotedPair: function () {
      if (this.notVotedPairs.length > 0) {
        let nextPair = this.notVotedPairs[0];
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

updateGraderName = function() {
  app.grader = gradername.value;
}

const filechooser = document.querySelector('#filechooser');
let images = [];

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

download = function() {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + app.csvContent());
  element.setAttribute('download', "ranking.csv");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
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