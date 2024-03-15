# Описание структуры файлов

## Хелперы с контекстом

Файлы с постфиксом `-mixin-helper.js` содержат в себе функции, что необходимо втыкать в контекст Vue:

```javascript
import { someFunction } from '~teacher/helpers/some-function-mixin-helper.js'

{
  methods: {
    someFunction
  }
}
```

- Почему не вынести в полноценный миксин?  
Я думаю, что так будет более явное использование без side effects
  

## Хелперы без контекста(pure functions)

Остальные файлы, типа `{some-name}-helper.js` содержат в себе pure функции.


