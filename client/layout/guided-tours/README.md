Guided Tours
============

Step-by-step tour framework for WordPress.com.

_Documentation in progress_

Architecture
------------

### Data: essential and derived state

_to do: our selector-based approach_

### Views

At its outermost level, Guided Tours is a single component, **`GuidedTours`**, rendered in Calypso's `Layout`. `GuidedTours` is essentially a wrapper which:

- takes care of the subsystem's data needs (via `connect` and `QueryPreferences`);
- binds Redux action creators for subsequent ease of consumption;
- renders `AllTours` within `RootChild`, as we need our DOM nodes (specifically, a tour's steps) not to be bound to `Layout` or any other specific subtree.

**`AllTours`** is created with **`combineTours`**. It is imported from [`config.js`][config]. Internally, it acts like a switch, only rendering the tour matching the `tourName` prop passed from above.

A *tour*, properly speaking, is stateless, class-based, lifecycle-aware component. However, they are not explicitly built as React components. Instead, they are created by passing an element tree (i.e., plain JSX) to a helper, **`makeTour`**. It was decided early on that the interface for building a tour should be simple and shouldn't place the burden of collecting and passing props on the tour author. Thus, some magic had to be involved. Notably, we need Guided Tours to be aware of two kinds of data:

- static per-tour data: what steps are involved, how they're to be positioned, etc. -- this is what tour authors write in plain JSX;
- dynamic Guided Tours state: whether we're in a tour, which step, etc. -- this is passed all the way from `GuidedTours`.

To combined these sources, an initial approach was based on `React.cloneElement`; it turned out to present limitations (performance and very interesting bugs due to a broken lifecycle) arising from the fact that cloning happened on every render. The solution was to leverage React's **`context`**. In a nutshell, the `makeTour` helper creates a component which simply renders the plain JSX tree without altering it, but it firstly makes the required dynamic data (state and bound actions) [available through the context][getChildContext].

Finally, the **plain JSX tour descriptions** are built using a set of [config elements] to create the flow of steps of a tour: `Tour`, `Step`, `Next`, `Continue`, `Quit`. These components are context-aware and have specialized logic that, ultimately, set up the control flow of a tour.

[config]: https://github.com/Automattic/wp-calypso/blob/master/client/layout/guided-tours/config.js
[getChildContext]: https://github.com/Automattic/wp-calypso/blob/bc97ba292a5f6213f0cf0c35219472135c4f9b9f/client/layout/guided-tours/config-elements.js#L480
[config elements]: https://github.com/Automattic/wp-calypso/blob/bc97ba292a5f6213f0cf0c35219472135c4f9b9f/client/layout/guided-tours/config-elements.js
