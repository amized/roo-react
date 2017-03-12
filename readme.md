# Reactoo

Stateful objects for React.

## Why

Let's say you want to use plain javascript classes to describe the logic and state of your application. You want your objects to control their own state and logic for how that state can be manipulated.

	class Organisation {
	
		setName(name) {
			this.name = name;
		}
	
	}
	
And then use React to render your UI by passing in your object as a prop:

	let myorg = new Organisation()
	...
	<MyComponent org={myorg} />	


For the initial render, this works ok. But if I want to my member function setName to trigger an update on my react component, we have to do something like this:


	class MyComponent extends React.Component {
	
		setOrgName = () => {
			this.props.org.setName("bar");
			this.forceUpdate();
		}
	
		render() {
			return (
				<div>
					<div>{this.props.org.name}</div>
					<button onClick={this.setOrgName}>Click</button>
				</div>
			)
		}
	}

This is problematic for a few reasons

* I need manually keep track of when I call member functions that change the state of my objects
* If I call the member function from outside React, or from a different component, there is no way to update the associated React elements on the page
* If I call member functions of other objects linked to myorg, React would have no way of knowing it needs to re render the element to reflect the state change

## How Reactoo works

Let's solve this by extending a ReactooClass
	
	import { ReactooClass } from 'reactoo'

	class Organisation extends ReactooClass  {
	
		setName(name) { 
			this.set({name}) 
		}
		
	}

In a Reactoo class, you need to make sure that instead of directly mutating the object's properties, you call ```this.set()```. This function will trigger a re-render of any React elements that have an ```Organisation``` object as a prop.

Now just use the ```connect``` wrapper on your component:

	import { connect } from 'reactoo'

	class MyComponent extends React.Component {
	
		render() {
			const org = this.props.org;
			return (
				<div>
					<div>{org.name}</div>
					<button onClick={()=>{org.setName("bar")}}>Click</button>
				</div>
			)
		}
	}
	
	MyComponent = connect(MyComponent);


and exactly as before, pass in your object as a prop

	let myorg = new Organisation()
	...
	<MyComponent org={myorg} /> 

Notice now there is no need for the extra update call, or even the extra method on our component. 

More importantly, I can now call the member function on my object from anywhere in my application and the React element will appropriately update.

	// In some place outside of React
	
	myorg.setName("James");
	






	