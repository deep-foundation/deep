import React from "react";

export class CatchErrors extends React.Component<{
  error?: any;
  onMounted?: (setError: (error?: any) => void) => void;
  errorRenderer?: (error: Error, reset: () => any, catcher: any) => React.ReactNode;
  reset?: () => any;
  children: any;
},any> {
  reset: () => any;

  constructor(props) {
    super(props);
    this.state = { error: undefined };

    this.reset = () => {
      this.setState({ error: undefined });
      this?.props?.reset && this?.props?.reset();
    };
  }

  static getDerivedStateFromError(error) {
    console.log('getDerivedStateFromError', error);
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    var err = error.constructor('Error in Evaled Script: ' + error.message);
    // +3 because `err` has the line number of the `eval` line plus two.
    err.lineNumber = error.lineNumber - err.lineNumber + 3;
    // console.log('componentDidCatch', err, errorInfo);
    console.log('componentDidCatch', error, errorInfo);
  }
  componentDidMounted() {
    this?.props?.onMounted && this?.props?.onMounted((error) => this.setState({ error: error }));
  }

  errorRenderer = (error, reset, catcher) => <>error native</>;

  render() {
    const error = this.props.error || this.state.error;
    if (error) {
      return this?.props?.errorRenderer ? this?.props?.errorRenderer(error, this.reset, this) : this?.errorRenderer(error, this.reset, this);
    }

    return this.props.children; 
  }
}
