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
    this.winner = null;
    this.voted = false;
  }

  _voteFor(item) {
    if (!this.voted) {
      item.score++;
      this.winner = item;
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

  isItem1Winner() {
    return this.winner == this.item1;
  }

  isItem2Winner() {
    return this.winner == this.item2;
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