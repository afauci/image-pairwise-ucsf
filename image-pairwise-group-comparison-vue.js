const app = new Vue({
  el: '#app',
  data: {
    items: [],
    pairs: [],
    metadata: new Map(),
    groups: new Map()
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
      for (const item of this.items) {
        this.pairs.push(new Pair(item, newItem));
      }
      this.items.push(newItem);
    },
    csvContent: function() {
      csvItems = "masterperson,rank,score\n";
      rank = 1;
      this.sortedItems.forEach(item => {
        var fields = [item.value.masterperson, rank, item.score]
        csvItems = csvItems.concat(fields.join(","), "\n");
        rank++;
      });
      return csvItems;
    }
  },
  computed: {
    sortedItems: function () {
      return Array.from(this.items).sort((a, b) => b.score - a.score);
    },
    notVotedPairs: function () {
      return this.pairs.filter(pair => !pair.voted);
    },
    nextNotVotedPair: function () {
      return this.notVotedPairs.length > 0 ? this.notVotedPairs[0] : null;
    },
    allPairsVoted: function () {
      console.log(this.notVotedPairs.length);
      return this.pairs.length > 0 && this.notVotedPairs.length == 0;
    }
  }
});

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
  app.items = [];
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

const exportcsv = document.getElementById('exportcsv');
download = function() {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + app.csvContent());
  element.setAttribute('download', "ranking.csv");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}