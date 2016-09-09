describe("EventModule", function() {
  describe('Models: EventModule', function() {
    beforeEach(module('edgefolio.models'));

    var $injector, $httpBackend, $rootScope;
    var ApiBaseClass, EventModule, TestBaseClass, TestClass1, TestClass2, testInstance1, testInstance2;

    beforeEach(module('edgefolio.models'));
    beforeEach(inject(function(_$injector_) {
      $injector    = _$injector_;
      $httpBackend = $injector.get('$httpBackend');
      $rootScope   = $injector.get('$rootScope');
      ApiBaseClass = $injector.get('ApiBaseClass');
      EventModule  = $injector.get('EventModule');

      TestBaseClass = new JS.Class("TestBaseClass", ApiBaseClass, {
        include: EventModule,

        initialize: function(name) {
          this.name = name;
          this.counter1 = 0;
          this.counter2 = 0;
        },
        incrementCounter1: function() {
          this.counter1++;
        },
        incrementCounter2: function() {
          this.counter2++;
        }
      });
      TestClass1 = new JS.Class("TestClass1", TestBaseClass, {});
      TestClass2 = new JS.Class("TestClass2", TestBaseClass, {});

      testInstance1 = new TestClass1("testInstance1");
      testInstance2 = new TestClass2("testInstance2");
    }));


    context('$bind should call a function on $trigger()', function() {
      it("simple function", function() {
        var counter1 = 0;
        testInstance1.$bind("test1", function() {
          counter1++;
        });
        testInstance1.$trigger("test1");
        expect(counter1).to.equal(1);
      });

      it('implicit this context', function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(1);
      });

      it('bound context as this', function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(1);
      });

      it('bound context as other', function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1, testInstance2);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(0);
        expect(testInstance2.counter1).to.equal(1);
      });

      it("calling $trigger multiple times", function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1);
        testInstance1.$trigger("test1");
        testInstance1.$trigger("test1");
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(3);
      });
    });

    context('$bind() deduplication', function() {
      it("multiple functions on same eventName", function() {
        testInstance1.$bind("test", testInstance1.incrementCounter1);
        testInstance1.$bind("test", testInstance1.incrementCounter2);
        testInstance1.$bind("test", testInstance2.incrementCounter1);
        testInstance1.$bind("test", testInstance2.incrementCounter2);

        testInstance1.$trigger("test");

        expect(testInstance1.incrementCounter1).to.equal(testInstance2.incrementCounter1);
        expect(testInstance1.incrementCounter2).to.equal(testInstance2.incrementCounter2);
        expect(testInstance1.counter1, "testInstance1.counter1").to.equal(1);
        expect(testInstance1.counter2, "testInstance1.counter2").to.equal(1);
        expect(testInstance2.counter1, "testInstance2.counter1").to.equal(0);
        expect(testInstance2.counter2, "testInstance2.counter2").to.equal(0);
      });

      it("separate bindings for same function on same eventName with different context", function() {
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance2);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance2);

        testInstance1.$trigger("test");

        expect(testInstance1.counter1, "testInstance1.counter1").to.equal(1);
        expect(testInstance1.counter2, "testInstance1.counter2").to.equal(1);
        expect(testInstance2.counter1, "testInstance2.counter1").to.equal(1);
        expect(testInstance2.counter2, "testInstance2.counter2").to.equal(1);
      });

      it("separate bindings for different functions on same eventName", function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1);
        testInstance2.$bind("test1", testInstance2.incrementCounter1);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(1);
        expect(testInstance2.counter1).to.equal(0);
      });

      it("separate bindings for different eventNames", function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1);
        testInstance1.$bind("test2", testInstance1.incrementCounter1);

        expect(testInstance1.counter1).to.equal(0);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(1);
        testInstance1.$trigger("test2");
        expect(testInstance1.counter1).to.equal(2);
      });

      it("avoid duplicate bindings", function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1);
        testInstance1.$bind("test1", testInstance1.incrementCounter1);
        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(1);
      });
    });

    context('$unbind()', function() {
      it('eventName unbind', function() {
        testInstance1.$bind("test1", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$bind("test2", testInstance1.incrementCounter2, testInstance1);
        testInstance1.$bind("test1", testInstance2.incrementCounter1, testInstance2);
        testInstance1.$bind("test2", testInstance2.incrementCounter2, testInstance2);
        testInstance1.$unbind("test1");

        testInstance1.$trigger("test1");
        expect(testInstance1.counter1).to.equal(0);
        expect(testInstance1.counter2).to.equal(0);
        expect(testInstance2.counter1).to.equal(0);
        expect(testInstance2.counter2).to.equal(0);

        testInstance1.$trigger("test2");
        expect(testInstance1.counter1).to.equal(0);
        expect(testInstance1.counter2).to.equal(1);
        expect(testInstance2.counter1).to.equal(0);
        expect(testInstance2.counter2).to.equal(1);
      });

      it('function unbind', function() {
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance2);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance2);

        testInstance1.$unbind("test", testInstance1.incrementCounter1);
        testInstance1.$trigger("test");

        expect(testInstance1.counter1, "testInstance1.counter1").to.equal(0);
        expect(testInstance1.counter2, "testInstance1.counter2").to.equal(1);
        expect(testInstance2.counter1, "testInstance2.counter1").to.equal(0);
        expect(testInstance2.counter2, "testInstance2.counter2").to.equal(1);
      });

      it('context unbind', function() {
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance1);
        testInstance1.$bind("test", testInstance2.incrementCounter1, testInstance2);
        testInstance1.$bind("test", testInstance2.incrementCounter2, testInstance2);

        testInstance1.$unbind("test", null, testInstance1);
        testInstance1.$trigger("test");

        expect(testInstance1.counter1, "testInstance1.counter1").to.equal(0);
        expect(testInstance1.counter2, "testInstance1.counter2").to.equal(0);
        expect(testInstance2.counter1, "testInstance2.counter1").to.equal(1);
        expect(testInstance2.counter2, "testInstance2.counter2").to.equal(1);
      });

      it('function and context unbind', function() {
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter1, testInstance2);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance1);
        testInstance1.$bind("test", testInstance1.incrementCounter2, testInstance2);

        testInstance1.$unbind("test", testInstance1.incrementCounter1, testInstance1);
        testInstance1.$trigger("test");

        expect(testInstance1.counter1, "testInstance1.counter1").to.equal(0);
        expect(testInstance1.counter2, "testInstance1.counter2").to.equal(1);
        expect(testInstance2.counter1, "testInstance2.counter1").to.equal(1);
        expect(testInstance2.counter2, "testInstance2.counter2").to.equal(1);
      });
    })
  });

  // TODO: Test for passing in arguments
});
