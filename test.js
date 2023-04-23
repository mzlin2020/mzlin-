function store() {
  this.store = {};
  if (store.install) {
    return store.install;
  }
  store.install = this;
}
var s1 = new store();
var s2 = new store();
s1.store.name = "lin";
console.log(s2);
