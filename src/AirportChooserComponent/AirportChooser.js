import React, { Component, Fragment } from 'react';
import './AirportChooser.css';
import utilsSingletonObject from './Utils/utils.js';

const AirportInformation = (props) => {
    return (
        <tbody className={props.highlightedRow ? 'highlightedRow' : 'notHighlightedRow'}><tr>
            <td>{props.airportInfoObj.name ? props.airportInfoObj.name : <span className="notAvailableEntry">Entry not available</span>}</td>
            <td>{props.airportInfoObj.code ? props.airportInfoObj.code : <span className="notAvailableEntry">Entry not available</span>}</td>
            <td>{props.airportInfoObj.city ? props.airportInfoObj.city : <span className="notAvailableEntry">Entry not available</span>}</td>
            <td>{props.airportInfoObj.country ? props.airportInfoObj.country : <span className="notAvailableEntry">Entry not available</span>}</td>
        </tr></tbody>
    );
}

class AirportChooser extends Component {
    constructor() {
        super();
        this.tableHeadings = [{id: '001', value: 'Name'}, {id: '002', value: 'Code'}, {id: '003', value: 'City'}, {id: '004', value: 'Country'}];
        this.entriesPerPageArr = [{id:'epp1', value: 300},{id:'epp2', value: 400},{id:'epp3', value: 500},{id:'epp4', value: 600},{id:'epp5', value: 700},{id:'epp6', value: 800},{id:'epp7', value: 900},{id:'epp8', value: 1000}];
        this.state = {
            showLoading : false,
            message: '',
            fullAirportList : [],
            paginatedAirportList : [],
            paginationObject : {
                totalPages : 0,
                pageNumber : 1,
                recordsPerPage : 300,
                startIndexOfPage : 0,
                endIndexOfPage : 300
            }
        };
    }

    render() {
        return (
            <Fragment>
                {this.state.paginatedAirportList.length === 0 ? <button className="fetchAirportListBtn" onClick={() => this.fetchAirportsList(this.props.url)}>Fetch Aiports</button> : null}
                <div>
                    {this.state.message !== '' ? <p>{this.state.message}</p> : ''}
                    {this.state.showLoading && this.state.paginatedAirportList.length === 0 && this.state.message === ''? <div className="loaderContainer"><div className="loader"></div></div> : ''}
                    {this.state.paginatedAirportList.length !== 0 ? <div className='airportListContainer'><table> 
                        <thead>
                            <tr>
                                {this.tableHeadings.map((item)=>{
                                    return <th key={item.id}>{item.value}</th>
                                })} 
                            </tr>
                        </thead>

                        {this.state.paginatedAirportList.map(  (item, index) => {
                            return <AirportInformation highlightedRow={index % 2 === 0} key={item.randomKey} airportInfoObj={item}/>
                        })}
                    </table> </div> : null }
                </div>
                {this.state.paginatedAirportList.length !== 0 ? 
                    <div className="paginationButtonDiv"> 
                        <span>Showing {this.state.paginationObject.startIndexOfPage + 1} to {this.state.paginationObject.endIndexOfPage > this.state.fullAirportList.length ? this.state.fullAirportList.length : this.state.paginationObject.endIndexOfPage} entries of {this.state.fullAirportList.length}, Show <select onChange={(event)=> this.onChangeEntriesPerPage(event)}> {
                            this.entriesPerPageArr.map((item) => {
                                return <option key={item.id} value={item.value}>{item.value}</option>
                            })
                        } </select> entries per page.</span>
                        <button onClick={()=>{this.paginateRecords('prev')}} disabled={this.state.paginationObject.pageNumber <= 1}>Previous</button> 
                        <button onClick={()=>{this.paginateRecords('next')}} disabled={this.state.paginationObject.pageNumber >= this.state.paginationObject.totalPages}>Next</button> 
                    </div> 
                : null}
            </Fragment>
        );
    }

    onChangeEntriesPerPage(event) {
        let newNumOfRecordsPerPage = +event?.target?.value;
        let newTotalPages = Math.ceil(this.state.fullAirportList.length / newNumOfRecordsPerPage);
        let paginationObject = Object.assign({}, this.state.paginationObject);
        if(newTotalPages < paginationObject.pageNumber) {
            paginationObject.pageNumber = 1;
        }
        paginationObject.totalPages = newTotalPages;
        paginationObject.recordsPerPage = newNumOfRecordsPerPage;
        this.callUtilsPaginateAndSetState(paginationObject);
    }

    async fetchAirportsList(url) {
        let showLoading = this.state.showLoading;
        showLoading = true;
        this.setState({showLoading : showLoading});
        let fullAirportList = await utilsSingletonObject.fetchAirportList(url);
        if(fullAirportList.type === 'error') {
            let message = `Problem in fetching list : ${fullAirportList.message}`;
            showLoading = false;
            this.setState({message : message});
            return;
        }
        let paginationObject = Object.assign({}, this.state.paginationObject);
        paginationObject.totalPages = Math.ceil(fullAirportList.length / paginationObject.recordsPerPage);
        let paginatedAirportList = fullAirportList.slice(0, paginationObject.recordsPerPage);
        showLoading = false;
        this.setState({showLoading : showLoading,fullAirportList : fullAirportList, paginatedAirportList : paginatedAirportList, paginationObject : paginationObject});
    }

    paginateRecords(whereToGo) {
        let paginationObject = Object.assign({}, this.state.paginationObject);
        paginationObject.pageNumber = whereToGo === 'next' ? paginationObject.pageNumber + 1 : paginationObject.pageNumber - 1;
        this.callUtilsPaginateAndSetState(paginationObject);
    }

    callUtilsPaginateAndSetState(paginationObject) {
        let fullAirportList = Object.assign([], this.state.fullAirportList);
        let newState = utilsSingletonObject.paginateRecordsBasedOnStatePaginationObject(paginationObject, fullAirportList);
        this.setState(newState);
    }
}

export default AirportChooser;