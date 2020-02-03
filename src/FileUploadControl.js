import React, { Component } from 'react';
import './FileUploadControl.css';

const SIZES = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

// HACK: This weird hack is necessary to circumvent the issue that toPrecision
// rounds *down* when the digits beyond the number of digits to be returned
//  specified is 5000... instead of up. This function is known to return NaN
// with extremely large or small numbers, but is okay for this application
function roundedTo(num, digits) {
  if (num === 0) {
    return num.toPrecision(digits);
  }
  let div = Math.pow(10, Math.floor(Math.log10(Math.abs(num))) + 1 - digits);
  return (Math.round(num / div) * div).toPrecision(digits);
}

// Returns a human readable number of bytes, e.g. 67.2 MB
function bytesToSizeString(numBytes) {
  if (numBytes < 0 || isNaN(numBytes)) {
    throw new RangeError('Invalid number of bytes');
  }

  numBytes = Math.floor(numBytes);
  let logLevel;
  let numString;

  if (numBytes < 1024) {
    logLevel = 0;
    numString = numBytes.toString();
  }
  else {
    logLevel = Math.min(Math.floor(Math.log2(numBytes) / 10), 8);
    let shiftedNum = numBytes / Math.pow(1024, logLevel);

    // Shift the log level up if rounds to 1024
    // This will always return 1.00 (unit) since
    // 0.9995 < 1023.5 / 1024 < 1024.5 / 1024 < 1.005
    if (Math.round(shiftedNum) === 1024 && logLevel < 8) {
      shiftedNum /= 1024;
      logLevel++;
    }

    if (shiftedNum >= 99.95) {
      numString = Math.round(shiftedNum).toString();
    }
    else {
      numString = roundedTo(shiftedNum, 3);
    }
  }

  return `${numString} ${SIZES[logLevel]}B`;
}

class FileUploadControl extends Component {
  constructor(props) {
    super(props);

    this.handleFileSelect = this.handleFileSelect.bind(this);

    this.state = {
      hasFile: false,
      fileName: '',
      fileSize: 0
    };
  }

  render() {
    let info;

    if (this.state.hasFile) {
      info = (<span>
        File name: { this.state.fileName }, size: { bytesToSizeString(this.state.fileSize) }
      </span>);
    }
    else {
      info = (<span>Select file</span>);
    }

    return (
      <div>
        <input
          type="file"
          ref={el => this.fileControl = el}
          onChange={this.handleFileSelect}
          className="fileUploadControl-fileControl" />
        <button className="btn btn-primary" onClick={ () => this.fileControl.click() }
          >Open files
        </button>
        { info }
      </div>
    );
  }

  handleFileSelect(ev) {
    const file = ev.target.files[0];

    if (!(file instanceof File)) {
      // Not a valid file
      return;
    }

    this.setState({
      hasFile: true,
      fileName: file.name,
      fileSize: file.size
    });

    const reader = new FileReader();
    reader.addEventListener('load', ev => {
      this.props.updateData(ev.target.result);
    });
    reader.readAsText(file);
  }
}

export default FileUploadControl;
export { roundedTo, bytesToSizeString };
