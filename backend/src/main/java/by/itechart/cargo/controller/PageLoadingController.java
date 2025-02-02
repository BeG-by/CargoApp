package by.itechart.cargo.controller;


import by.itechart.cargo.service.impl.PageLoaderServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/loader")
public class PageLoadingController {

    private final PageLoaderServiceImpl pageLoaderServiceImpl;

    @Autowired
    public PageLoadingController(PageLoaderServiceImpl pageLoaderServiceImpl) {
        this.pageLoaderServiceImpl = pageLoaderServiceImpl;
    }

    @GetMapping("/page")
    public ResponseEntity<String> downloadPage(@RequestParam String url) {
        pageLoaderServiceImpl.savePage(url);
        return ResponseEntity.ok("In process");
    }
}
