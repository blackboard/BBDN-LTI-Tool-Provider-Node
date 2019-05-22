import Button from "@material-ui/core/Button/index";
import TextField from "@material-ui/core/TextField/index";
import React from "react";

class PollSetup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pollId: "",
      question: "",
      options: [""],
      newOptions: ""
    };
  }

  componentDidMount() {
    // TODO: remove hard coded id
    const pollId = "1234567";

    fetch(`getQuestion?pollId=${pollId}`)
      .then(res => {
        return res.text();
      })
      .then(value => {
        this.setState({
          question: value
        });
      });
    fetch(`getOptions?pollId=${pollId}`)
      .then(res => {
        return res.json();
      })
      .then(value => {
        this.setState({
          options: value
        });
      });
    this.setState({
      pollId: pollId
    });
  }

  handleQuestionChange(event) {
    console.dir(`handleQuestionChange ${event.target.value}`);
    this.setState({
      question: event.target.value
    });
  }

  handleNewOptionsChange(event) {
    console.dir(`handlenewOptionsChange ${event.target.value}`);
    this.setState({
      newOptions: event.target.value
    });
    event.target.value = "";
  }

  addOption(options, nextChoice) {
    console.dir(`addOption <${nextChoice}> ${nextChoice.length}`);

    if (nextChoice !== undefined && nextChoice.length > 0) {
      options.push(nextChoice);
      this.setState({
        options: options,
        newOptions: ""
      });
    } else {
      console.dir(`nextChoice is undefined or empty`);
    }
  }

  deleteChoice(e) {
    console.dir(`deleteChoice`);
    // https://stackoverflow.com/questions/36326612/delete-item-from-state-array-in-react
    // var array = [...this.state.options]; // make a separate copy of the array
    // var index = array.indexOf(e.target.value)
    // if (index !== -1) {
    //     array.splice(index, 1);
    //     this.setState({people: array});
    // }
  }

  save() {
    console.dir(`save to redis`);
  }

  cancel() {
    console.dir(`cancel`);
  }

  render() {
    const { options } = this.state;
    let container = [];
    options.forEach((choice, index) => {
      container.push(<div>{choice}</div>);
      /**
             * 1. All loop generated elements require a key
             * 2. only one parent element can be placed in Array
             * e.g. container.push(<div key={index}>
             val
             </div>
             <div>
             this will throw error
             </div>
             )
             **/
    });

    return (
      <div>
        <div>
          <h3>Poll Question Setup</h3>
        </div>
        <div>
          <form action="pollDefine" method="POST">
            <div>
              <FormGroup>
                <TextField
                  label={"Question"}
                  variant={"outlined"}
                  placeholder={"Enter Question"}
                  value={this.state.question}
                  onChange={this.handleQuestionChange.bind(this)}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </FormGroup>
              <div />
              <div id="container-div">{container}</div>
              <div />
            </div>
            <br />
            <div>
              <TextField
                label={"Choice"}
                variant={"outlined"}
                placeholder={"Enter Choice"}
                value={this.state.newOptions}
                onChange={this.handleNewOptionsChange.bind(this)}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <div>
                <Button
                  onClick={() =>
                    this.addOption(this.state.options, this.state.newOptions)
                  }>
                  Add Choice
                </Button>
              </div>
            </div>
            <div>
              <Button onClick={this.cancel}>Cancel</Button>{" "}
              <Button onClick={this.save}>Save</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default PollSetup;
