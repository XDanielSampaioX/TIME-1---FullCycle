package br.com.rotae.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class MockApiController {
    private static final Set<String> RESOURCES = Set.of(
            "usuarios", "passageiros", "cidades", "viagens", "assentos",
            "viagens_assentos", "onibus", "reservas", "passagens", "pagamentos");

    private final Map<String, Map<Long, Map<String, Object>>> data = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> sequences = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MockApiController() {
        RESOURCES.forEach(resource -> {
            data.put(resource, new ConcurrentHashMap<>());
            sequences.put(resource, new AtomicLong(0));
        });
        seedFromResource("cidades", "mock/cidades.json");
        seedFromResource("onibus", "mock/onibus.json");
        seedFromResource("assentos", "mock/assentos.json");
        seedFromResource("usuarios", "mock/usuarios.json");
        seedFromResource("passageiros", "mock/passageiros.json");
        seedFromResource("viagens", "mock/viagens.json");
        seedFromResource("viagens_assentos", "mock/viagens-assentos.json");
        seedFromResource("reservas", "mock/reservas.json");
        seedFromResource("passagens", "mock/passagens.json");
        seedFromResource("pagamentos", "mock/pagamentos.json");
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "mock", true, "timestamp", OffsetDateTime.now());
    }

    @GetMapping("/{resource}")
    public Collection<Map<String, Object>> list(@PathVariable String resource) {
        validateResource(resource);
        return data.get(resource).values();
    }

    @GetMapping("/{resource}/{id}")
    public Map<String, Object> find(@PathVariable String resource, @PathVariable Long id) {
        validateResource(resource);
        var item = data.get(resource).get(id);
        if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado");
        return item;
    }

    @PostMapping("/{resource}")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@PathVariable String resource, @RequestBody Map<String, Object> body) {
        validateResource(resource);
        var item = new LinkedHashMap<String, Object>(body);
        long id = sequences.get(resource).incrementAndGet();
        item.put("id", id);
        data.get(resource).put(id, item);
        return item;
    }

    @PutMapping("/{resource}/{id}")
    public Map<String, Object> update(@PathVariable String resource, @PathVariable Long id,
                                      @RequestBody Map<String, Object> body) {
        validateResource(resource);
        if (!data.get(resource).containsKey(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado");
        var item = new LinkedHashMap<String, Object>(body);
        item.put("id", id);
        data.get(resource).put(id, item);
        return item;
    }

    @DeleteMapping("/{resource}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String resource, @PathVariable Long id) {
        validateResource(resource);
        if (data.get(resource).remove(id) == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro não encontrado");
    }

    private void validateResource(String resource) {
        if (!RESOURCES.contains(resource))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso não disponível");
    }

    private void seed(String resource, Map<String, Object> body) {
        var item = new LinkedHashMap<String, Object>(body);
        long id = sequences.get(resource).incrementAndGet();
        item.put("id", id);
        data.get(resource).put(id, item);
    }

    private void seedFromResource(String resource, String path) {
        try {
            var resourceFile = new ClassPathResource(path);
            var items = objectMapper.readValue(
                    resourceFile.getInputStream(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );
            items.forEach(item -> {
                var id = ((Number) item.get("id")).longValue();
                data.get(resource).put(id, new LinkedHashMap<>(item));
                sequences.get(resource).updateAndGet(current -> Math.max(current, id));
            });
        } catch (Exception exception) {
            throw new IllegalStateException("Não foi possível carregar os dados mockados de " + path, exception);
        }
    }
}
