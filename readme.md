# Roo

### Stateful objects that will update your React components.

## Object Oriented programing
Let's say you want to use plain javascript classes to describe the logic and state of your application. You want your objects to control their own state and logic for how that state can be manipulated. 
Roo gives you a way of doing this while using React for your UI.

##Who's this really good for?

In some sense React already adopts an OO methodology - components are objects that hold state and logic for updating their state. And this is perfect for describing a user interface. It's even perfect for building simple applications who's job it is to display or submit data, like a website.

But if you're building a more complex web/HTML application like...

* a game
* a simulation
* an AI
* modeling

you'll probably want to structure your application logic yourself, and make sure it is decoupled from your UI. Javascript classes are a great way of modularising your logic, but currently it's a bit messy trying to mix these with React.

##Example
Let's say your application has an Organisation.



	
```javascript
class Organisation {
  setName(name) {
    this.name = name
  }
}
```
	
And then you use React to render your UI by passing in your object as a prop:

```javascript
let myorg = new Organisation()

<MyComponent org={myorg} />	
```

For the initial render, this works ok. But if I want to my member function ```setName()``` to trigger an update on my react component, we have to do something like this:

```javascript

class MyWrapper extends React.Component {
  
  constructor() {
  	super(props);
  	this.state = {
  	  org: new Organisation()
  	}
  }

  setOrgName = () => {
    this.state.org.setName("bar")
    this.setState({
      org: this.state.org
    })
 }
  
  render() {
	return (
	  <div>
		<MyComponent org={this.state.myorg} setOrgName={this.setOrgName}/>
	  </div>
	)
  }
}



class MyComponent extends React.Component {

  render() {
	return (
	  <div>
		<div>{this.props.org.name}</div>
		<button onClick={this.props.setOrgName}>Click</button>
	  </div>
	)
  }

}
```
### This is problematic for a few reasons

* I need to manually keep track every time I call member functions on ```Organisation``` that modify the object's state, and then make sure I follow it with a ```setState()```


* If I call the member function from outside React, or from a different component, there is no way to update the associated React elements on the page

* Code is a bit ugly!

## How Roo works
Let's solve this by extending a RooClass

```javascript
import { Class } from 'roo-react'

class Organisation extends Class  {
  setName(name) { 
    this.set({name}) 
  }
}
```	

In a Roo class, you need to make sure that instead of directly mutating the object's properties, you call ```this.set()```. This function will trigger a re-render of any React elements that have an ```Organisation``` object as a prop.

Just to reiterate, in Roo **don't do this**: 

```javascript
this.name = "henry"
```

Do this:

```javascript
this.set({ 
  name: "henry"
})
``` 
 
 
It's also fine to mutate your object's properties, as long as you call ```set()``` to do so.

Now just use the ```connect``` wrapper on your component:

```javascript
import { connect } from 'roo-react'

class MyComponent extends React.Component {
  render() {
    const org = this.props.org
    return (
      <div>
        <div>{org.name}</div>
        <button onClick={()=>{ org.setName("bar") }}>Click</button>
      </div>
    )
  }
}
	
MyComponent = connect(MyComponent)
```
Notice now there is no need for the extra update call, or even the extra method on our component. Also conviniently, the methods for updating the state are passed along with the objects, saving code on explicitly passing down state-setting functions through props.

Don't forget to pass in your object as a prop to the component for re-rendering to work

```javascript
let myorg = new Organisation()
...
<MyComponent org={myorg} /> 
```



I can now call the member function on my object from anywhere in my application and the React element will appropriately update.

```javascript
$(".IJustWannaUseJqueryHereOk").on("click", ()=>{
  myorg.setName("James")
  // The React component updates
}	

```


Feedback is welcome.

 

## License

MIT | © 2017 [Amiel Zwier](http://amielzwier.com)
	