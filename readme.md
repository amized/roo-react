# Roo

### Stateful objects that will update your React components.

## Why

### Object-oriented design
Let's say you want to use plain javascript classes to describe the logic and state of your application. You want your objects to control their own state and logic for how that state can be manipulated.
	
```javascript
class Organisation {
  setName(name) {
    this.name = name
  }
}
```
	
And then use React to render your UI by passing in your object as a prop:

```javascript
let myorg = new Organisation()

<MyComponent org={myorg} />	
```

For the initial render, this works ok. But if I want to my member function setName to trigger an update on my react component, we have to do something like this:

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      org: props.org
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
		<div>{this.state.org.name}</div>
		<button onClick={this.setOrgName}>Click</button>
	  </div>
	)
  }
}
```

### This is problematic for a few reasons

* I need manually keep track of when I call member functions that change the state of my objects
* If I call the member function from outside React, or from a different component, there is no way to update the associated React elements on the page
* If I call member functions of other objects linked to ```myorg```, React would have no way of knowing it needs to re render the element to reflect the state change

## How Reactoo works
Let's solve this by extending a ReactooClass

```javascript
import { Class } from 'reactoo'

class Organisation extends Class  {
  setName(name) { 
    this.set({name}) 
  }
}
```	

In a Reactoo class, you need to make sure that instead of directly mutating the object's properties, you call ```this.set()```. This function will trigger a re-render of any React elements that have an ```Organisation``` object as a prop.

Just to reiterate, in Reactoo **don't do this**: 

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
import { connect } from 'reactoo'

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

and exactly as before, pass in your object as a prop

```javascript
let myorg = new Organisation()
...
<MyComponent org={myorg} /> 
```

Notice now there is no need for the extra update call, or even the extra method on our component. As a convenient bonus, the methods for updating the state are passed with the objects, saving code on manually passing down state-setting functions through props.

More importantly, I can now call the member function on my object from anywhere in my application and the React element will appropriately update.

```javascript
$(".IJustWannaUseJqueryHereOk").on("click", ()=>{
  myorg.setName("James")
  // The React component updates
}	

```
#Who's this really good for?

In some sense React already adopts an OO methodology - components are objects that hold state and logic for updating their state. And this is perfect for describing a user interface. It's even perfect for building simple applications who's job it is to display or submit data, like a website.

But if you're building a more complex backend to your application, like:

* a game
* a simulation
* an AI
* modeling

You'll probably want to structure your application logic yourself, and make sure it is decoupled from your UI. Reactoo gives you a way of doing this in an object-oriented style, with plain javascript objects that are stateful, mutable and efficient. Connect them to React with ease and you don't need to worry about an inconsistent interface.

Feedback is welcome.

 

## License

MIT | © 2017 [Amiel Zwier](http://amielzwier.com)
	