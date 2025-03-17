import { v4 as uuidv4 } from 'uuid';

// Память о one->one one<-many
export class Memory {
	// Здесь храняться отношения от одного к одному.
	_one = new Map();
	// Здесь храняться обратные отношения к одному от многих.
	_many = new Map();
	// Установление кому-то отношения по этому вектору.
  // Оно же удаление значения если value = undefined.
  set(key, value) {
    const prev = this._one.get(key);
    this._one.delete(key);
    const prevSet = this._many.get(prev);
    if (prevSet && prevSet.has(key)) prevSet.delete(key);
    if (typeof(value) !== 'undefined') {
      let nextSet = this._many.get(value);
      if (!nextSet) this._many.set(value, nextSet = new Set());
      nextSet.add(key);
      this._one.set(key, value);
    }
    return true;
  }
  delete(key) {
    return this.set(key, undefined);
  }
  // Получение чьего-то отношения по этому вектору или его отсутствие.
  one(key) {
    return this._one.get(key);
  }
  // Получить всех кто относится ко мне по этмоу вектору.
  many(value) {
    let set = this._many.get(value);
    if (!set) this._many.set(value, set = new Set());
    return set;
  }
}

// Память о факте присвоенности идентификаторов в контексте того или иного агента
export class Ids {
  _it = new Map(); // Map<id, it>
  _ids = new Map(); // Map<it, Map<agent, id>>
  id(it, agent, _id) {
    const exists = this._ids.get(it);
    let id;
    if (!exists) {
      this._ids.set(it, new Map([[agent, id = _id || uuidv4()]]));
    } else {
      id = exists.get(agent);
      if (!id) {
        exists.set(agent, id = _id || uuidv4());
      } else if (_id) {
        exists.set(agent, id = _id);
      }
    }
    return id;
  }
}
