package by.itechart.cargo.bean_post_processors.cacheable;

import org.ehcache.Cache;
import org.ehcache.CacheManager;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.CacheManagerBuilder;
import org.ehcache.config.builders.ExpiryPolicyBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CacheableMethodAnnotationBeanPostProcessor implements BeanPostProcessor {
    CacheManager cacheManager;

    public CacheableMethodAnnotationBeanPostProcessor() {
        cacheManager = CacheManagerBuilder.newCacheManagerBuilder().build();
        cacheManager.init();
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        Method[] methods = bean.getClass().getDeclaredMethods();
        List<Method> cacheableMethods = new ArrayList<>();
        for (Method method : methods) {
            CacheableMethod annotation = method.getAnnotation(CacheableMethod.class);
            if (annotation != null) {
                cacheableMethods.add(method);
            }
        }
        if (cacheableMethods.size() == 0) {
            return bean;
        }
        return insertCacheableLogic(bean, cacheableMethods);
    }

    private Object insertCacheableLogic(Object bean, List<Method> cacheableMethods) {
        Map<String, CacheStructure> cachesStructures = createCachesForMethods(cacheableMethods);
        Class<?> beanClass = bean.getClass();
        return Proxy.newProxyInstance(beanClass.getClassLoader(), beanClass.getInterfaces(), (proxy, method, args) -> {
            if (isCacheableMethod(cachesStructures, method)) {
                return method.invoke(bean, args);
            }
            CacheStructure cacheStructure = cachesStructures.get(method.getName());
            Cache<Object, Object> cache = cacheManager.getCache(cacheStructure.getName(), cacheStructure.getKeyClass(), cacheStructure.getValueClass());
            if (cache.containsKey(args[0])) {
                return cache.get(args[0]);
            } else {
                Object result = method.invoke(bean, args);
                cache.put(args[0], result);
                return result;
            }
        });
    }

    private boolean isCacheableMethod(Map<String, CacheStructure> cachesStructures, Method method) {
        return !cachesStructures.containsKey(method.getName());
    }

    private Map<String, CacheStructure> createCachesForMethods(List<Method> cacheableMethods) {
        Map<String, CacheStructure> cacheNames = new HashMap<>();
        for (Method cacheableMethod : cacheableMethods) {
            try {
                cacheNames.put(cacheableMethod.getName(), createCacheForMethod(cacheableMethod));
            } catch (InvalidMethodForCache ignored) {
            }
        }
        return cacheNames;
    }

    private CacheStructure createCacheForMethod(Method method) throws InvalidMethodForCache {
        CacheableMethod annotation = method.getAnnotation(CacheableMethod.class);
        int ttl = annotation.ttl();
        int amountHeapEntries = annotation.amountHeapEntries();

        if (isValidMethodForCache(method)) {
            String cacheName = method.getName();
            Class<Object> methodParameter = (Class<Object>) method.getParameters()[0].getType();
            Class<Object> returnType = (Class<Object>) method.getReturnType();

            CacheStructure cacheStructure = new CacheStructure(cacheName, methodParameter, returnType);

            var configuration = CacheConfigurationBuilder
                    .newCacheConfigurationBuilder(methodParameter, returnType, ResourcePoolsBuilder.heap(amountHeapEntries))
                    .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ttl)));

            cacheManager.createCache(cacheName, configuration);
            return cacheStructure;
        } else {
            throw new InvalidMethodForCache();
        }
    }

    private boolean isValidMethodForCache(Method method) {
        return method.getParameterCount() == 1 && !method.getParameters()[0].getType().equals(void.class);
    }
}
