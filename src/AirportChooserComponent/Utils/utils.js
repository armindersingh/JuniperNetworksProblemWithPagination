function utils(){
    return {
        fetchAirportList : async function fetchAirportList(url) {
            let response;
            try{
                response = await fetch(url);
            } catch(err) {
                return {type : 'error', message : err};
            }
            if (response.ok) { 
                let json = await response.json();
                json.forEach((item) => {
                    return item['randomKey'] = this.generateRandomKeys(item.code);
                });
                return json;
            } else {
                return {type : 'error', message : response.status};
            }
        }, generateRandomKeys : function(keyword) {
            return `${keyword}_${ new Date().getTime() }`;
        }, paginateRecordsBasedOnStatePaginationObject : function(paginationObject, fullAirportList) {
            let startIndex = (paginationObject.recordsPerPage * paginationObject.pageNumber) - paginationObject.recordsPerPage;
            paginationObject.startIndexOfPage = startIndex ; 
            let endIndex = startIndex + paginationObject.recordsPerPage;
            paginationObject.endIndexOfPage = endIndex;
            let paginatedAirportList = fullAirportList.slice(startIndex, endIndex);
            return {paginatedAirportList : paginatedAirportList, paginationObject : paginationObject};
        }
    }
}

function singleton() {
    let instanceOfUtils;
    return {
        getSingletonUtilsObject : function getInstance() {
            if(!instanceOfUtils) {
                instanceOfUtils = new utils();
            }
            return instanceOfUtils;
        }
    }
}

let single = singleton();
export default single.getSingletonUtilsObject();

