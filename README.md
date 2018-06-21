# vue-rich-grid
Powerful and flexible grid component for vuejs

## Install
```
npm install vue-rich-grid --save
```

## Quick Start
### Importing into your component
```
<template>
  <div id="app">
      <rich-grid :options="grid" :data="rows" />
  </div>
</template>

<script>
import richGrid from 'vue-rich-grid'

export default {
  name: 'app',
  components: { 'rich-grid': richGrid },
  data () {
    return {
        rows: [{
                id: 1,
                title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
                body: "quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto",
            },
            {
                id: 2,
                title: "qui est esse",
                body: "est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla",
            }
        ],
        grid: {
            columns: [{
                id : "id",
            }, {
                id : "body",
            }],
        },
    }
  }
}
</script>
```

## License
This project is licensed under the MIT License