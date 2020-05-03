

class Taskk {

    constructor(api_obj) {
        this.id = api_obj._id;
        this.name = api_obj.name;
        this.notes = api_obj.notes;
        this.completed = api_obj.completed;
        this.parent = api_obj.parent;
		this.children = api_obj.children;
		this.dueDate = api_obj.dueDate;
    }

}

export default Taskk;