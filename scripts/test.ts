class A {
  constructor() {
    console.log('Constructor A');
    this.start();
  }
  protected start() {
    console.log('Start A');
  }
}

class B extends A {
  constructor() {
    super();
    console.log('Constructor B');
    super.start();
  }

  protected start() {
    console.log('Start B');
  }
}

const b = new B();

console.log(b);
