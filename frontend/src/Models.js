

class Taskk {

    constructor(api_obj) {
        this.id = api_obj._id;
        this.name = api_obj.name;
        this.notes = api_obj.notes;
        this.complete = api_obj.completed;
        this.parent = api_obj.parent;
        this.children = api_obj.parent;
    }

}

export default Taskk;