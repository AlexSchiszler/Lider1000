self.addEventListener('fetch', function(event) {
  // Mantém o comportamento padrão de busca na rede
  event.respondWith(fetch(event.request));
});
