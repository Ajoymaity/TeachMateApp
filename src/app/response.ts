export interface Response {
    id:           string;
    ver:          string;
    ts:           Date;
    params:       Params;
    responseCode: string;
    result:       Result;
  }
  
  export interface Params {
    resmsgid: string;
    msgid:    string;
    status:   string;
    err:      null;
    errmsg:   null;
  }
  
  export interface Result {
    count:   number;
    content: Content[];
    facets:  Facet[];
  }
  
  export interface Content {
    trackable:       Trackable;
    identifier:      string;
    subject:         string[];
    channel:         string;
    organisation:    string[];
    mimeType:        string;
    medium:          string[];
    pkgVersion:      number;
    objectType:      string;
    gradeLevel:      string[];
    appIcon:         string;
    primaryCategory: string;
    name:            string;
    contentType:     string;
    board:           string;
    resourceType:    string;
    orgDetails:      OrgDetails;
  }
  
  export interface OrgDetails {
    email:   null;
    orgName: string;
  }
  
  export interface Trackable {
    enabled:   string;
    autoBatch: string;
  }
  
  export interface Facet {
    values: Value[];
    name:   string;
  }
  
  export interface Value {
    name:  string;
    count: number;
  }